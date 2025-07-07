# LLM-Driven Linux Terminal v1.0.0

A production-ready Linux terminal emulator powered by Claude Sonnet 4 that seamlessly understands both traditional Linux commands and natural language requests. This innovative system demonstrates how Large Language Models can maintain complex stateful environments while providing an intuitive user interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Key Features

### Dual-Mode Command Processing
- **Traditional Linux Commands**: Full support for essential shell commands with proper Linux semantics
- **Natural Language Understanding**: Express complex intentions in plain English
- **Seamless Integration**: Mix and match both modes in your workflow

### Core Capabilities
- **File System Operations**: Complete hierarchical file system with permissions
- **Process Management**: Process table with PID management and states
- **User Permissions**: Unix-style permission system (owner/group/other)
- **Environment Variables**: Full environment variable support
- **Command History**: Navigate previous commands with arrow keys
- **Multi-line Input**: Use Shift+Enter for complex commands or scripts
- **Real-time State**: Live working directory and process count display

## 🚀 Quick Start

### Basic Linux Commands
```bash
# Navigate directories
/home/user$ 
> cd /etc
/etc$ 
> pwd
/etc

# List files with details
/etc$ 
> ls -la
total 16
drwxr-xr-x 2 root root 4096 2024-01-15 10:00 .
drwxr-xr-x 8 root root 4096 2024-01-15 10:00 ..
-rw-r--r-- 1 root root  115 2024-01-15 10:00 hosts
-rw-r--r-- 1 root root   84 2024-01-15 10:00 passwd

# Create and manipulate files
/home/user$ 
> touch README.md
/home/user$ 
> echo "# My Project" > README.md
/home/user$ 
> cat README.md
# My Project
```

### Natural Language Examples
```bash
# Create complex structures
/home/user$ 
> create a Python web application structure with Flask
Creating Flask application structure...
Created: app.py, requirements.txt, templates/, static/, config.py

# Perform system queries
/home/user$ 
> show me all configuration files in the etc directory
/etc/hosts     - Network host configuration
/etc/passwd    - User account information

# Multi-step operations
/home/user$ 
> set up a Node.js project with Express and a test directory
> add a .gitignore file for Node projects
> create a basic Express server in app.js
```

### Multi-line Commands
Press `Shift+Enter` to write multi-line inputs:
```bash
/home/user$ 
> create a shell script that:
  - checks if a directory exists
  - creates it if it doesn't
  - adds a timestamp file inside
Created: check_dir.sh with the requested functionality
```

## 🏗️ Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────┐
│                   React Terminal UI                       │
│                 (User Input & Display)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Command Processor                         │
│          (Parsing & History Management)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Claude Sonnet 4 API                        │
│            (window.claude.complete)                       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│           Conceptual Data Model (CDM)                     │
│         (State Validation & Constraints)                  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Linux OS State                           │
│    (Filesystem, Processes, Environment, Users)            │
└─────────────────────────────────────────────────────────┘
```

### State Structure
```javascript
{
  filesystem: {
    "/": {
      type: "directory",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      modified: "2024-01-15T10:00:00Z",
      children: {
        "home": { /* ... */ },
        "etc": { /* ... */ },
        "bin": { /* ... */ },
        // ... more directories
      }
    }
  },
  processes: [
    {
      pid: 1,
      ppid: 0,
      command: "/sbin/init",
      user: "root",
      state: "sleeping",
      cpu: 0.0,
      mem: 0.1
    },
    // ... more processes
  ],
  nextPid: 1001,
  currentUser: "user",
  currentDirectory: "/home/user",
  environment: {
    PATH: "/usr/local/bin:/usr/bin:/bin",
    HOME: "/home/user",
    USER: "user",
    PWD: "/home/user",
    // ... more variables
  }
}
```

## 🔧 Technical Implementation

### Conceptual Data Model (CDM)

The CDM ensures consistency across sessions and Claude model versions:

1. **Filesystem Constraints**
   - Default permissions: `-rw-r--r--` (files), `drwxr-xr-x` (directories)
   - Maximum path depth: 20 levels
   - Maximum filename length: 255 characters
   - Automatic timestamp updates

2. **Process Constraints**
   - Sequential PID assignment (never reused)
   - Valid states: `running`, `sleeping`, `stopped`, `zombie`
   - Reserved PIDs: 0, 1
   - User PIDs start at 1000

3. **Permission Model**
   - Standard Unix permissions (rwx for owner/group/other)
   - Root user (UID 0) has full access
   - Permission checks on all file operations

### Error Handling

The system provides robust error handling:
- **Malformed Responses**: Multiple JSON extraction strategies
- **State Validation**: Automatic correction of invalid states
- **User Feedback**: Clear error messages with appropriate exit codes
- **Graceful Recovery**: Fallback to previous state on critical errors

### Performance Optimizations

- **Client-side Commands**: `clear` and `help` execute instantly
- **Memoized Computations**: Prompt generation and state derivations
- **Efficient Rendering**: Proper React keys and update batching
- **Lazy State Updates**: Only modified portions are recalculated

## 📚 Command Reference

### File Operations
| Command | Description | Example |
|---------|-------------|---------|
| `ls [-la]` | List directory contents | `ls -la /home` |
| `cd <path>` | Change directory | `cd /etc` |
| `pwd` | Print working directory | `pwd` |
| `mkdir <name>` | Create directory | `mkdir projects` |
| `touch <file>` | Create/update file | `touch app.js` |
| `rm [-r] <path>` | Remove files/directories | `rm -r old_files` |
| `cp <src> <dst>` | Copy files/directories | `cp config.json backup/` |
| `mv <src> <dst>` | Move/rename | `mv old.txt new.txt` |
| `cat <file>` | Display file contents | `cat /etc/hosts` |
| `echo <text>` | Output text | `echo "Hello" > file.txt` |

### Process Management
| Command | Description | Example |
|---------|-------------|---------|
| `ps` | List processes | `ps` |
| `kill <pid>` | Terminate process | `kill 1234` |

### Other Commands
| Command | Description |
|---------|-------------|
| `chmod <mode> <file>` | Change permissions |
| `clear` | Clear terminal screen |
| `help` | Show command help |

### Keyboard Shortcuts
- `Enter` - Execute command
- `Shift+Enter` - New line in multi-line input
- `↑/↓` - Navigate command history
- `Ctrl+L` - Clear screen

## 🌐 Natural Language Examples

The terminal understands complex requests:

```bash
# Development Tasks
> create a REST API structure for a blog application
> add authentication middleware to the Express server
> generate a dockerfile for a Node.js application

# File Management
> find all JavaScript files modified today
> organize these files into a src directory
> create a backup of the current directory

# System Information
> what processes are consuming the most memory?
> show me the directory structure as a tree
> list all environment variables related to paths
```

## 🛡️ Security & Limitations

- **Sandboxed Environment**: All operations are simulated in-browser
- **No Real System Access**: Cannot affect your actual filesystem
- **No Network Operations**: No external connections or downloads
- **No Hardware Access**: Cannot interact with system devices
- **Memory-based State**: State resets on page reload

## 🚦 Development

### Prerequisites
- Modern web browser with ES6 support
- Access to Claude API (via `window.claude.complete`)

### Key Files
- **LinuxTerminal Component**: Main React component
- **CDM Implementation**: State validation and constraints
- **Command Processor**: Natural language and shell command handling

### Adding New Commands

To add a new command, update the Claude prompt instructions:
```javascript
// In buildClaudePrompt function
"16. newcmd: description of what it does"
```

And add it to the KNOWN_COMMANDS array:
```javascript
const KNOWN_COMMANDS = [
  // ... existing commands
  'newcmd'
];
```

## 🔮 Future Roadmap

### v1.1 - Enhanced Shell Features
- [ ] Pipe operations (`|`)
- [ ] Input/output redirection (`<`, `>`, `>>`)
- [ ] Command chaining (`&&`, `||`, `;`)
- [ ] Background processes (`&`)

### v1.2 - Advanced File Operations
- [ ] File search (`find`, `grep`)
- [ ] Archive operations (`tar`, `zip`)
- [ ] File permissions visualization
- [ ] Symbolic links

### v1.3 - Scripting Support
- [ ] Bash script execution
- [ ] Variables and conditionals
- [ ] Loops and functions
- [ ] Script debugging

### v2.0 - Extended Capabilities
- [ ] Virtual network stack
- [ ] Package management simulation
- [ ] Multi-user support
- [ ] Persistent state (localStorage)
- [ ] File editor (vi/nano simulation)

## 🤝 Contributing

Contributions are welcome! Key areas for improvement:

1. **Command Coverage**: Add more Linux commands
2. **Natural Language**: Improve understanding of complex requests
3. **Performance**: Optimize state management and rendering
4. **Testing**: Add comprehensive test suites
5. **Documentation**: Expand examples and use cases

## 📄 License

MIT License - feel free to use this project for educational and commercial purposes.

## 🙏 Acknowledgments

- **Powered by**: Claude Sonnet 4 by Anthropic
- **Built with**: React, Tailwind CSS
- **Inspired by**: Unix/Linux shell design principles
- **Contributors**: Human-AI collaboration

---

*This project demonstrates the potential of Large Language Models to maintain complex stateful systems while providing intuitive natural language interfaces. It serves as a foundation for exploring how AI can enhance traditional computing paradigms.*
