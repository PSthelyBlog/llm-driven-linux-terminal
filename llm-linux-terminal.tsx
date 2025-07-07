import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * LLM-Driven Linux Terminal
 * 
 * A production-ready Linux terminal emulator powered by Claude Sonnet 4.
 * Supports both traditional Linux commands and natural language processing.
 * 
 * @version 1.0.0
 * @author Claude & Human Collaboration
 */

// Constants
const KNOWN_COMMANDS = [
  'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 
  'cat', 'echo', 'ps', 'kill', 'chmod', 'clear', 'help'
];

const CDM_RULES = {
  filesystem: {
    defaultPermissions: {
      file: '-rw-r--r--',
      directory: 'drwxr-xr-x',
      executable: '-rwxr-xr-x'
    },
    maxPathDepth: 20,
    maxNameLength: 255
  },
  processes: {
    validStates: ['running', 'sleeping', 'stopped', 'zombie'],
    reservedPids: [0, 1],
    userPidStart: 1000
  },
  users: {
    root: { uid: 0, gid: 0, home: '/root' },
    user: { uid: 1000, gid: 1000, home: '/home/user' }
  }
};

const LinuxTerminal = () => {
  /**
   * Initialize the Linux OS state with a realistic filesystem
   */
  const getInitialState = useCallback(() => {
    const timestamp = new Date().toISOString();
    
    return {
      filesystem: {
        "/": {
          type: "directory",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          modified: timestamp,
          children: {
            "home": {
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {
                "user": {
                  type: "directory",
                  permissions: "drwxr-xr-x",
                  owner: "user",
                  group: "user",
                  modified: timestamp,
                  children: {
                    ".bashrc": {
                      type: "file",
                      permissions: "-rw-r--r--",
                      owner: "user",
                      group: "user",
                      content: "# .bashrc\n\n# User specific aliases and functions\nalias ll='ls -la'\nalias la='ls -A'\nalias l='ls -CF'\n\n# Prompt\nexport PS1='\\u@\\h:\\w\\$ '\n",
                      size: 148,
                      modified: timestamp
                    },
                    ".profile": {
                      type: "file",
                      permissions: "-rw-r--r--",
                      owner: "user",
                      group: "user",
                      content: "# .profile\n# This file is executed by the command interpreter for login shells.\n\n# Set PATH\nexport PATH=$PATH:$HOME/bin\n",
                      size: 123,
                      modified: timestamp
                    }
                  }
                }
              }
            },
            "etc": {
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {
                "passwd": {
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "root",
                  group: "root",
                  content: "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:Default User:/home/user:/bin/bash\n",
                  size: 84,
                  modified: timestamp
                },
                "hosts": {
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "root",
                  group: "root",
                  content: "127.0.0.1\tlocalhost\n::1\t\tlocalhost ip6-localhost ip6-loopback\nff02::1\t\tip6-allnodes\nff02::2\t\tip6-allrouters\n",
                  size: 115,
                  modified: timestamp
                }
              }
            },
            "bin": {
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {}
            },
            "usr": {
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {
                "bin": {
                  type: "directory",
                  permissions: "drwxr-xr-x",
                  owner: "root",
                  group: "root",
                  modified: timestamp,
                  children: {}
                },
                "local": {
                  type: "directory",
                  permissions: "drwxr-xr-x",
                  owner: "root",
                  group: "root",
                  modified: timestamp,
                  children: {
                    "bin": {
                      type: "directory",
                      permissions: "drwxr-xr-x",
                      owner: "root",
                      group: "root",
                      modified: timestamp,
                      children: {}
                    }
                  }
                }
              }
            },
            "var": {
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {
                "log": {
                  type: "directory",
                  permissions: "drwxr-xr-x",
                  owner: "root",
                  group: "root",
                  modified: timestamp,
                  children: {
                    "syslog": {
                      type: "file",
                      permissions: "-rw-r-----",
                      owner: "root",
                      group: "adm",
                      content: `${timestamp} System initialized\n`,
                      size: 35,
                      modified: timestamp
                    }
                  }
                }
              }
            },
            "tmp": {
              type: "directory",
              permissions: "drwxrwxrwt",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {}
            },
            "root": {
              type: "directory",
              permissions: "drwx------",
              owner: "root",
              group: "root",
              modified: timestamp,
              children: {}
            }
          }
        }
      },
      processes: [
        { pid: 1, ppid: 0, command: "/sbin/init", user: "root", state: "sleeping", cpu: 0.0, mem: 0.1 },
        { pid: 2, ppid: 0, command: "[kthreadd]", user: "root", state: "sleeping", cpu: 0.0, mem: 0.0 },
        { pid: 1000, ppid: 1, command: "bash", user: "user", state: "running", cpu: 0.1, mem: 0.2 }
      ],
      nextPid: 1001,
      currentUser: "user",
      currentDirectory: "/home/user",
      environment: {
        PATH: "/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin",
        HOME: "/home/user",
        USER: "user",
        SHELL: "/bin/bash",
        PWD: "/home/user",
        LANG: "en_US.UTF-8",
        TERM: "xterm-256color",
        LOGNAME: "user"
      }
    };
  }, []);

  // State management
  const [osState, setOsState] = useState(getInitialState);
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for DOM elements
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Apply CDM constraints to ensure state consistency
   */
  const applyCDMConstraints = useCallback((newState, oldState) => {
    try {
      // Deep clone to avoid mutations
      const state = JSON.parse(JSON.stringify(newState));
      
      // Helper function to normalize filesystem nodes
      const normalizeNode = (node, path = '') => {
        if (!node || typeof node !== 'object') return node;
        
        // Ensure type field exists
        if (!node.type) {
          node.type = node.children ? 'directory' : 'file';
        }
        
        // Apply default permissions if missing
        if (!node.permissions || node.permissions === '') {
          if (node.type === 'file') {
            node.permissions = CDM_RULES.filesystem.defaultPermissions.file;
          } else if (node.type === 'directory') {
            node.permissions = CDM_RULES.filesystem.defaultPermissions.directory;
          }
        }
        
        // Ensure owner/group fields
        if (!node.owner) node.owner = state.currentUser || 'user';
        if (!node.group) node.group = state.currentUser || 'user';
        
        // Add missing timestamps
        if (!node.modified) node.modified = new Date().toISOString();
        
        // Calculate size for files
        if (node.type === 'file' && node.content && !node.size) {
          node.size = new TextEncoder().encode(node.content).length;
        }
        
        // Recursively normalize children
        if (node.children && typeof node.children === 'object') {
          Object.entries(node.children).forEach(([name, child]) => {
            // Validate filename
            if (name.length > CDM_RULES.filesystem.maxNameLength) {
              console.warn(`Filename too long: ${name}`);
              delete node.children[name];
            } else {
              normalizeNode(child, `${path}/${name}`);
            }
          });
        }
        
        return node;
      };
      
      // Normalize filesystem
      if (state.filesystem && state.filesystem['/']) {
        normalizeNode(state.filesystem['/'], '');
      } else {
        console.error('CDM: Invalid filesystem structure');
        state.filesystem = oldState.filesystem;
      }
      
      // Validate and fix processes
      if (state.processes && Array.isArray(state.processes)) {
        state.processes = state.processes.filter(p => {
          // Ensure required fields
          if (!p.pid || !p.command) return false;
          
          // Validate state
          if (!CDM_RULES.processes.validStates.includes(p.state)) {
            p.state = 'sleeping';
          }
          
          // Ensure numeric values
          p.pid = parseInt(p.pid);
          p.ppid = parseInt(p.ppid || 0);
          p.cpu = parseFloat(p.cpu || 0);
          p.mem = parseFloat(p.mem || 0);
          
          return true;
        });
        
        // Update nextPid
        const maxPid = Math.max(...state.processes.map(p => p.pid), 1000);
        state.nextPid = Math.max(state.nextPid || 1001, maxPid + 1);
      } else {
        state.processes = oldState.processes;
        state.nextPid = oldState.nextPid;
      }
      
      // Validate current directory
      const pathExists = (path, filesystem) => {
        if (!path || !filesystem) return false;
        if (path === '/') return true;
        
        const parts = path.split('/').filter(p => p);
        let current = filesystem['/'];
        
        for (const part of parts) {
          if (!current || !current.children || !current.children[part]) {
            return false;
          }
          current = current.children[part];
        }
        return current && current.type === 'directory';
      };
      
      if (!pathExists(state.currentDirectory, state.filesystem)) {
        console.warn(`CDM: Invalid directory '${state.currentDirectory}', reverting`);
        state.currentDirectory = oldState.currentDirectory;
      }
      
      // Sync environment PWD with current directory
      if (state.environment) {
        state.environment.PWD = state.currentDirectory;
      } else {
        state.environment = oldState.environment;
      }
      
      // Ensure required state fields
      state.currentUser = state.currentUser || oldState.currentUser || 'user';
      
      return state;
    } catch (error) {
      console.error('CDM validation error:', error);
      return oldState; // Fallback to old state on error
    }
  }, []);

  /**
   * Build the prompt for Claude API
   */
  const buildClaudePrompt = useCallback((state, command) => {
    return `You are simulating a Linux operating system kernel. You must respond with ONLY valid JSON.

CURRENT STATE:
${JSON.stringify(state, null, 2)}

USER COMMAND: ${command}

CDM RULES TO ENFORCE:
- File permissions: new files get '-rw-r--r--', new directories get 'drwxr-xr-x'
- PIDs: increment from nextPid (currently ${state.nextPid}), never reuse
- Paths: validate existence before cd, show "bash: cd: [path]: No such file or directory" if invalid
- Permissions: check write access for file operations
- Process states: must be one of [running, sleeping, stopped, zombie]
- File sizes: calculate based on content length
- Timestamps: update modified time when changing files

COMMAND INSTRUCTIONS:
1. Process the command (Linux shell command or natural language)
2. ls: list directory contents (-l for long format, -a for hidden files)
3. cd: change currentDirectory and update PWD
4. pwd: return current directory path
5. mkdir: create directories with proper permissions
6. touch: create empty files or update timestamps
7. cat: display file contents
8. echo: output text (support > and >> redirection)
9. rm: remove files/directories (-r for recursive)
10. cp/mv: copy or move files/directories
11. ps: show process list
12. kill: terminate process by PID
13. chmod: change file permissions
14. clear: return empty output
15. help: show available commands
16. Natural language: interpret intent and execute equivalent operations

Current directory: ${state.currentDirectory}
Current user: ${state.currentUser}
Prompt format: [directory]$

RESPONSE FORMAT (ONLY valid JSON, no other text):
{
  "new_state": {complete updated state object},
  "terminal_output": "exact text to display to user",
  "exit_code": 0
}`;
  }, []);

  /**
   * Execute a command
   */
  const executeCommand = useCallback(async (command) => {
    const trimmedCommand = command.trim();
    
    // Handle empty commands
    if (!trimmedCommand) {
      setCurrentCommand('');
      return;
    }

    // Special case: clear command (handled client-side for performance)
    if (trimmedCommand === 'clear') {
      setCommandHistory([]);
      setCurrentCommand('');
      return;
    }

    // Special case: help command (handled client-side)
    if (trimmedCommand === 'help') {
      const helpText = `Available commands:
  File Operations:
    ls [-la]          List directory contents
    cd <path>         Change directory
    pwd               Print working directory
    mkdir <name>      Create directory
    touch <file>      Create file or update timestamp
    rm [-r] <path>    Remove files/directories
    cp <src> <dst>    Copy files/directories
    mv <src> <dst>    Move/rename files/directories
    cat <file>        Display file contents
    echo <text>       Display text (> redirect, >> append)
    
  Process Management:
    ps                Show running processes
    kill <pid>        Terminate process
    
  Permissions:
    chmod <mode> <file>  Change file permissions
    
  Other:
    clear             Clear terminal screen
    help              Show this help message
    
  Natural Language:
    You can also use natural language commands like:
    - "create a Python web server"
    - "show me all files in this directory"
    - "make a project folder structure"
    
  Keyboard Shortcuts:
    Ctrl+L            Clear screen
    ↑/↓               Navigate command history
    Shift+Enter       Multi-line input`;
    
      const newEntry = {
        prompt: `${osState.currentDirectory}$ `,
        command: trimmedCommand,
        output: helpText,
        timestamp: new Date(),
        exitCode: 0
      };
      
      setCommandHistory(prev => [...prev, newEntry]);
      setCurrentCommand('');
      return;
    }

    // Add command to history
    const newEntry = {
      prompt: `${osState.currentDirectory}$ `,
      command: command,
      output: '',
      timestamp: new Date()
    };

    setCommandHistory(prev => [...prev, newEntry]);
    setCurrentCommand('');
    setHistoryIndex(-1);
    setIsProcessing(true);

    try {
      const prompt = buildClaudePrompt(osState, command);
      const response = await window.claude.complete(prompt);
      
      let result;
      
      // Parse response with multiple fallback strategies
      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.log('Direct parse failed, attempting extraction...');
        
        // Try different extraction patterns
        const patterns = [
          /\{[\s\S]*\}$/,                    // JSON at end
          /^\{[\s\S]*\}/,                    // JSON at start
          /```json\s*(\{[\s\S]*?\})\s*```/,  // Markdown JSON block
          /```\s*(\{[\s\S]*?\})\s*```/,      // Generic code block
          /(\{[\s\S]*\})/                    // Any JSON object
        ];
        
        let extracted = null;
        for (const pattern of patterns) {
          const match = response.match(pattern);
          if (match) {
            extracted = match[1] || match[0];
            try {
              result = JSON.parse(extracted);
              console.log('Successfully extracted JSON');
              break;
            } catch (e) {
              continue;
            }
          }
        }
        
        if (!result) {
          throw new Error('Failed to extract valid JSON from response');
        }
      }

      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Response is not an object');
      }
      
      if (!result.new_state || typeof result.new_state !== 'object') {
        throw new Error('Missing or invalid new_state');
      }
      
      // Provide defaults for missing fields
      if (typeof result.terminal_output !== 'string') {
        result.terminal_output = '';
      }
      
      if (typeof result.exit_code !== 'number') {
        result.exit_code = 0;
      }

      // Apply CDM constraints
      const validatedState = applyCDMConstraints(result.new_state, osState);
      
      // Update OS state
      setOsState(validatedState);

      // Update command history with output
      setCommandHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].output = result.terminal_output;
        updated[updated.length - 1].exitCode = result.exit_code;
        return updated;
      });

    } catch (error) {
      console.error('Command execution error:', error);
      
      // Generate appropriate error message
      let errorMessage;
      const baseCommand = trimmedCommand.split(' ')[0];
      
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = `Error: Failed to process command '${baseCommand}'. Response parsing failed.`;
      } else if (error.message.includes('Claude')) {
        errorMessage = 'Error: Failed to connect to Claude. Please try again.';
      } else if (KNOWN_COMMANDS.includes(baseCommand)) {
        errorMessage = `Error: Command '${baseCommand}' failed. Please try again.`;
      } else {
        errorMessage = `bash: ${baseCommand}: command not found`;
      }
      
      setCommandHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].output = errorMessage;
        updated[updated.length - 1].exitCode = error.message.includes('not found') ? 127 : 1;
        return updated;
      });
    } finally {
      setIsProcessing(false);
      // Restore focus to input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [osState, buildClaudePrompt, applyCDMConstraints]);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback((e) => {
    // Execute command on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand(currentCommand);
    }
    // Navigate history with arrow keys (only for single-line input)
    else if (e.key === 'ArrowUp' && !currentCommand.includes('\n')) {
      e.preventDefault();
      const commands = commandHistory.filter(h => h.command).map(h => h.command);
      if (historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commands[commands.length - 1 - newIndex]);
      }
    }
    else if (e.key === 'ArrowDown' && !currentCommand.includes('\n')) {
      e.preventDefault();
      if (historyIndex > 0) {
        const commands = commandHistory.filter(h => h.command).map(h => h.command);
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commands[commands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
    // Clear screen with Ctrl+L
    else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setCommandHistory([]);
    }
  }, [currentCommand, commandHistory, historyIndex, executeCommand]);

  /**
   * Auto-scroll to bottom when new content is added
   */
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Maintain focus on input
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandHistory, isProcessing]);

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Generate the prompt string
   */
  const getPrompt = useMemo(() => 
    `${osState.currentDirectory}$ `,
    [osState.currentDirectory]
  );

  return (
    <div className="w-full h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      {/* Terminal Body */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto cursor-text select-text"
        onClick={() => !isProcessing && inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        <div className="mb-4 text-green-400">
          <div className="font-bold text-lg mb-2">LLM Linux Terminal v1.0.0</div>
          <div>Powered by Claude Sonnet 4</div>
          <div className="text-gray-500 text-sm mt-2">
            Type 'help' for available commands • Use natural language or Linux commands
          </div>
          <div className="text-gray-500 text-sm">
            Press Shift+Enter for multi-line input • Ctrl+L to clear screen
          </div>
          <div className="mt-3 border-t border-gray-700"></div>
        </div>

        {/* Command History */}
        {commandHistory.map((entry, index) => (
          <div key={`cmd-${index}-${entry.timestamp}`} className="mb-3">
            <div className="text-green-400">{entry.prompt}</div>
            <div className="flex items-start">
              <span className="text-green-400 flex-shrink-0">{'>'}</span>
              <span className="text-white whitespace-pre-wrap ml-1">{entry.command}</span>
            </div>
            {entry.output && (
              <div className={`whitespace-pre-wrap mt-1 ${
                entry.exitCode === 0 ? 'text-gray-300' : 'text-red-400'
              }`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current Prompt */}
        {isProcessing ? (
          <div className="flex items-center">
            <span className="text-yellow-400 animate-pulse">● Processing...</span>
          </div>
        ) : (
          <div>
            <div className="text-green-400">{getPrompt}</div>
            <div className="flex items-start">
              <span className="text-green-400 flex-shrink-0">{'>'}</span>
              <textarea
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none resize-none overflow-hidden font-mono ml-1"
                disabled={isProcessing}
                autoComplete="off"
                spellCheck="false"
                autoFocus
                placeholder="Enter command..."
                rows={Math.max(1, currentCommand.split('\n').length)}
                style={{ 
                  minHeight: '1.5rem', 
                  lineHeight: '1.5rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center text-xs text-gray-400 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="text-gray-500 mr-1">user:</span>
            <span className="text-gray-300">{osState.currentUser}</span>
          </span>
          <span className="flex items-center">
            <span className="text-gray-500 mr-1">pwd:</span>
            <span className="text-gray-300">{osState.currentDirectory}</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="text-gray-500 mr-1">processes:</span>
            <span className="text-gray-300">{osState.processes.length}</span>
          </span>
          <span className="flex items-center">
            <span className="text-gray-500 mr-1">pid:</span>
            <span className="text-gray-300">
              {osState.processes.find(p => p.command === 'bash')?.pid || 'N/A'}
            </span>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-500">
            {isProcessing ? 'Processing...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LinuxTerminal;