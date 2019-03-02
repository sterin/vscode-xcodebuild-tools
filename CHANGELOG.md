# Change Log
All notable changes to the "vscode-xcodebuild-tools" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 0.0.7
- Add a way of supplying additional arguments to `xcodebuild`. Thanks to @amatosov-rbx.

## 0.0.6
- Fix debugging (switch to new `vscode.debug.startDebugging()`).

## 0.0.5
- Support environment variables in configuration file.
- Add preBuildTasks section to configuration file for task running before building.

## 0.0.4
- Add the ability to specify the SDK in xcodebuild-tools.json
- Fix severity of messages in Problem View. Previously, all messages were displayed as errors.
- Updated README.md with an iOS example.

## 0.0.3
- Save all before building.
- Add a new status icon for running (without a debugger) the selected debug configuration.

## 0.0.2
- Add a new command, xcobdebuild-tools.profile, to start the macOS Instruments profiler with 'Time Profiler' template on the current debug configuration.

## 0.0.1
- Initial release

