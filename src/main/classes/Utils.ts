import { spawn } from 'child_process'
import fs from 'fs'

export default class Utils {
    static shouldIgnoreFileOrFolder(
        filename: string,
        ignorePrefixes: string[],
        ignoreFileExtensions: string[]
    ): boolean {
        if (ignorePrefixes.length > 0) {
            for (const prefix of ignorePrefixes) {
                if (filename.startsWith(prefix)) {
                    return true
                }
            }
        }

        const isFile = fs.lstatSync(filename).isFile()
        if (isFile && ignoreFileExtensions.length > 0) {
            for (const ext of ignoreFileExtensions) {
                if (filename.endsWith(ext)) {
                    return true
                }
            }
        }

        return false
    }
    public static runInstallInTerminal(commandToRun: string): void {
        switch (process.platform) {
            case 'win32': {
                // Use cmd.exe with /k to keep the window open after command finishes
                const child = spawn('cmd.exe', ['/k', commandToRun], {
                    detached: true,
                    stdio: 'ignore' // Detach from parent's stdio
                })
                child.unref() // Allow parent (Electron) to exit independently
                break
            }

            case 'darwin': {
                // Use osascript to tell Terminal.app to run the command
                const child = spawn(
                    'osascript',
                    [
                        '-e',
                        `tell app "Terminal" to do script "${commandToRun}"`,
                        '-e',
                        'tell app "Terminal" to activate'
                    ],
                    {
                        detached: true,
                        stdio: 'ignore'
                    }
                )
                child.unref()
                break
            }

            case 'linux': {
                // 1. Try the most common modern default (GNOME)
                // 2. If it fails (due to error event), try the standard symlink

                const terminals = [
                    {
                        name: 'gnome-terminal',
                        args: ['--', 'bash', '-c', `${commandToRun}; exec bash`]
                    },
                    {
                        name: 'x-terminal-emulator',
                        args: ['-e', `bash -c "${commandToRun}; exec bash"`]
                    }
                    // You could optionally add Konsole here
                    // { name: 'konsole', args: ['-e', `bash -c "${commandToRun}; exec bash"`] }
                ]

                let currentTerminalIndex = 0

                function trySpawn() {
                    if (currentTerminalIndex >= terminals.length) {
                        console.error('All terminal fallbacks failed on Linux.')
                        return
                    }

                    const { name, args } = terminals[currentTerminalIndex]
                    const child = spawn(name, args, { detached: true, stdio: 'ignore' })
                    child.unref()

                    child.on('error', (err) => {
                        console.warn(
                            `Failed to spawn ${name}: ${err.message}. Trying next fallback.`
                        )
                        currentTerminalIndex++
                        trySpawn() // Recursively try the next one
                    })
                }

                trySpawn()
                break
            }

            default:
                console.error(`Unsupported platform: ${process.platform}`)
            // As a last resort, you could notify the user
            // to run the command manually.
        }
    }

    public static diffObjects(
        original: any,
        validated: any,
        path: string[] = []
    ): { added: string[]; removed: string[]; changed: string[] } {
        const added: string[] = []
        const removed: string[] = []
        const changed: string[] = []

        const allKeys = new Set([...Object.keys(original || {}), ...Object.keys(validated || {})])

        for (const key of allKeys) {
            const fullPath = [...path, key].join('.')

            const inOriginal = Object.prototype.hasOwnProperty.call(original, key)
            const inValidated = Object.prototype.hasOwnProperty.call(validated, key)

            if (inOriginal && !inValidated) {
                removed.push(fullPath)
                continue
            }

            if (!inOriginal && inValidated) {
                added.push(fullPath)
                continue
            }

            const originalVal = original[key]
            const validatedVal = validated[key]

            // Compare nested objects recursively
            if (
                typeof originalVal === 'object' &&
                typeof validatedVal === 'object' &&
                originalVal !== null &&
                validatedVal !== null
            ) {
                const nested = Utils.diffObjects(originalVal, validatedVal, [...path, key])
                added.push(...nested.added)
                removed.push(...nested.removed)
                changed.push(...nested.changed)
                continue
            }

            // Compare values (handle NaN, type mismatch, etc.)
            const valuesDiffer =
                typeof originalVal !== typeof validatedVal ||
                (Number.isNaN(originalVal) && !Number.isNaN(validatedVal)) ||
                (!Number.isNaN(originalVal) &&
                    !Number.isNaN(validatedVal) &&
                    originalVal !== validatedVal)

            if (valuesDiffer) {
                changed.push(fullPath)
            }
        }

        return { added, removed, changed }
    }

    public static defaultRarPath(): string {
        const platform = process.platform

        if (platform === 'win32') {
            console.log('Determining default RAR path for Windows')
            // 1. Check common WinRAR installation directories
            const winRarPaths = [
                'C:\\Program Files\\WinRAR\\Rar.exe',
                'C:\\Program Files (x86)\\WinRAR\\Rar.exe'
            ]
            for (const p of winRarPaths) {
                if (fs.existsSync(p)) {
                    console.log(`Found WinRAR at: ${p}`)
                    return p
                }
            }

            return 'C:\\Program Files\\WinRAR\\Rar.exe'
        }

        return 'rar'
    }
}
