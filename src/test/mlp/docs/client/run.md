---
layout: default
title: run.py
parent: Server
---

# `run.py`

**Python Script for Concurrent Command Execution with Colored Output**

### Dependencies:
- **subprocess**: Used for running new applications or programs through Python.
- **threading**: Allows for running different parts of the program concurrently.
- **os**: Provides a way of using operating system dependent functionality.
- **fcntl**: Allows for file control and I/O operations on file descriptors.
- **select**: Provides a way to wait for I/O completion on multiple streams.
- **colorama**: A third-party module used for making ANSI escape character sequences work under MS Windows terminals.
- **termcolor**: A third-party module used for coloring terminal text.

## Functions:
1. **`set_nonblocking(fd)`**:
   - Sets the file descriptor `fd` to non-blocking mode.
2. **`run_command(command, app_name, color)`**:
   - Runs a shell command in a non-blocking manner using `subprocess.Popen`.
   - Sets `stdout` and `stderr` of the process to non-blocking mode.
   - Continuously reads from the process's output and error, printing anything that is emitted.
   - Colors the output according to the specified `app_name` and `color`.
   - Returns the process's exit code once it finishes.
3. **`run_server()`**:
   - Wrapper function to run the server application.
4. **`run_client()`**:
   - Wrapper function to run the client application.

## Main Execution Flow:
1. Initializes **colorama** for colored output compatibility across different operating systems.
2. Defines a list of target functions representing different services to run concurrently (e.g., a web server and a client).
3. Starts a new thread for each target function, running the corresponding commands concurrently.
4. Waits for all threads to complete before exiting.
