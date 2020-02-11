import { JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import { ISettingRegistry } from "@jupyterlab/coreutils";
import { IDisposable } from "@phosphor/disposable";
import { CommandRegistry } from "@phosphor/commands";

interface Command {
    name: string;
    commands: string[];
}

class MultiCommandPlugin {
    private disposers: IDisposable[] = [];

    constructor(private commands: CommandRegistry, private settings: ISettingRegistry.ISettings) {
        settings.changed.connect(this.updateSetting, this);

        const command_configs = (settings.user as any)["commands"];
        this.registerCommands(command_configs);
    }

    registerCommands(settings: Command[]) {
        for (const command of settings) {
            const disposer = this.commands.addCommand(command.name, {
                execute: async () => {
                    for (const name of command.commands) {
                        await this.commands.execute(name);
                    }
                },
            });
            this.disposers.push(disposer);
        }
    }

    unregisterCommands() {
        for (const disposer of this.disposers) {
            disposer.dispose();
        }
    }

    updateSetting(settings: ISettingRegistry.ISettings) {
        const command_configs = (settings.user as any)["commands"];
        this.unregisterCommands();
        this.registerCommands(command_configs);
    }

    destruct() {
        this.unregisterCommands();
        this.settings.changed.disconnect(this.updateSetting);
    }
}

const plugin: JupyterFrontEndPlugin<void> = {
    id: "jupyterlab-multi-command:plugin",
    autoStart: true,
    requires: [ISettingRegistry],

    async activate(app: JupyterFrontEnd, registry: ISettingRegistry) {
        new MultiCommandPlugin(app.commands, await registry.load(plugin.id));
    },
};

export default plugin;
