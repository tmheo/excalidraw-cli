import { Command, Flags, Args } from '@oclif/core'
import { computeUserInputs } from './compute'

export default class ExcalidrawCli extends Command {
    static description = 'Parses Excalidraw JSON schemas into PNGs'

    static flags = {
        version: Flags.version({char: 'v'}),
        help: Flags.help({char: 'h'}),
        quiet: Flags.boolean({ char: 'q', description: 'disable console outputs' })
    }

    static args = {
        input: Args.string({
            description: 'Excalidraw file path / directory path',
            required: false,
            default: '{cwd}'
        }),
        output: Args.string({
            description: 'Output PNG file path / directory path',
            required: false,
            default: '{cwd}'
        })
    }

    async run() {
        const parsed = await this.parse(ExcalidrawCli)
        computeUserInputs(parsed)
    }
}
