import { JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import { ISettingRegistry } from "@jupyterlab/coreutils";
import { ICommandPalette } from "@jupyterlab/apputils";
import { IDisposable } from "@phosphor/disposable";
import { CommandRegistry } from "@phosphor/commands";
import { ReadonlyJSONObject } from "@phosphor/coreutils";

interface Entry {
    name: string;
    commands?: Command[];
    category?: string;
    label?: string;
}

type Command = string | { command: string; args?: ReadonlyJSONObject };

class MultiCommandPlugin {
    private disposers: IDisposable[] = [];

    constructor(
        private commands: CommandRegistry,
        private settings: ISettingRegistry.ISettings,
        private palette: ICommandPalette,
    ) {
        settings.changed.connect(this.updateSetting, this);

        this.registerCommands(this.getConfig());
    }

    getConfig(): Entry[] {
        const def: Entry[] = this.settings.default("commands") as any;
        const user: Entry[] = this.settings.user.commands as any;
        const merged: { [key: string]: Entry } = {};

        for (const entry of [].concat(def, user)) {
            merged[entry.name] = entry;
        }

        return Object.values(merged);
    }

    registerCommands(entries: Entry[]) {
        for (const entry of entries) {
            if (entry.commands === undefined || entry.commands.length === 0) {
                continue;
            }

            const commandDisposer = this.commands.addCommand(entry.name, {
                label: entry.label,
                execute: async () => {
                    for (const command of entry.commands || []) {
                        if (typeof command === "string") {
                            await this.commands.execute(command);
                        } else {
                            await this.commands.execute(command.command, command.args);
                        }
                    }
                },
            });

            if (entry.category !== undefined && entry.label !== undefined) {
                const paletteDisposer = this.palette.addItem({
                    category: entry.category,
                    command: entry.name,
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

    updateSetting() {
        this.unregisterCommands();
        this.registerCommands(this.getConfig());
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
        new MultiCommandPlugin(app.commands, await registry.load(plugin.id), palette);
    },
};

export default plugin;
