import { JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import { ISettingRegistry } from "@jupyterlab/coreutils";
import { ICommandPalette } from "@jupyterlab/apputils";
import { IDisposable } from "@phosphor/disposable";
import { CommandRegistry } from "@phosphor/commands";

interface Command {
    name: string;
    commands: string[];
    category?: string;
    label?: string;
}

class MultiCommandPlugin {
    private disposers: IDisposable[] = [];

    constructor(
        private commands: CommandRegistry,
        private settings: ISettingRegistry.ISettings,
        private palette: ICommandPalette,
    ) {
        settings.changed.connect(this.updateSetting, this);

        this.registerCommands((settings.user as any)["commands"]);
    }

    registerCommands(commands: Command[]) {
        for (const command of commands) {
            const commandDisposer = this.commands.addCommand(command.name, {
                label: command.label,
                execute: async () => {
                    for (const name of command.commands) {
                        await this.commands.execute(name);
                    }
                },
            });

            if (command.category !== undefined && command.label !== undefined) {
                const paletteDisposer = this.palette.addItem({
                    category: command.category,
                    command: command.name,
                });
                this.disposers.push(paletteDisposer);
            }

            this.disposers.push(commandDisposer);
        }
    }

    unregisterCommands() {
        for (const disposer of this.disposers) {
            disposer.dispose();
        }
    }

    updateSetting(settings: ISettingRegistry.ISettings) {
        this.unregisterCommands();
        this.registerCommands((settings.user as any)["commands"]);
    }

    dispose() {
        this.unregisterCommands();
        this.settings.changed.disconnect(this.updateSetting);
    }
}

const plugin: JupyterFrontEndPlugin<void> = {
    id: "jupyterlab-multi-command:plugin",
    autoStart: true,
    requires: [ISettingRegistry, ICommandPalette],

    async activate(app: JupyterFrontEnd, registry: ISettingRegistry, palette: ICommandPalette) {
        console.log(1);
        new MultiCommandPlugin(app.commands, await registry.load(plugin.id), palette);
    },
};

export default plugin;
