/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const { Gio } = imports.gi;

const DEFAULT_SCHEME_NAME = 'default';
const LIGHT_SCHEME_NAME = 'prefer-light';
const DARK_SCHEME_NAME = 'prefer-dark';

class Extension {
    constructor() {
        this.schema = Gio.Settings.new('org.gnome.desktop.interface');
    }

    enable() {
        const handleThemeChange = (theme_name) => {
            switch(theme_name)
            {
                case DEFAULT_SCHEME_NAME:
                case LIGHT_SCHEME_NAME:
                    if (this.schema.get_string('gtk-theme').endsWith("-dark")) {
                        this.schema.set_string('gtk-theme', this.schema.get_string('gtk-theme').slice(0,-5));
                    }
                    break;
                case DARK_SCHEME_NAME:
                    if (!this.schema.get_string('gtk-theme').endsWith("-dark")) {
                        this.schema.set_string('gtk-theme', this.schema.get_string('gtk-theme') + "-dark");
                    }
                    break;
                default:
                    break;
            }
        }

        const onSettingChanged = (connection, sender, path, iface, signal, params) => {
            const setting_category = params.get_child_value(0);
            if (setting_category.get_type_string() !== 's' || setting_category.get_string()[0] !== 'org.gnome.desktop.interface')
                return;

            const setting_name = params.get_child_value(1);
            if (setting_name.get_type_string() !== 's' || setting_name.get_string()[0] !== 'color-scheme')
                return;

            const setting_value = params.get_child_value(2).get_child_value(0);
            if (setting_value.get_type_string() !== 's')
                return

            handleThemeChange(setting_value.get_string()[0]);
        }

        this.connection = Gio.DBus.session;
        this.handlerId = this.connection.signal_subscribe(
            null,
            'org.freedesktop.portal.Settings',
            'SettingChanged',
            '/org/freedesktop/portal/desktop',
            'org.gnome.desktop.interface',
            Gio.DBusSignalFlags.NONE,
            onSettingChanged
        );
    }

    disable() {
        this.connection.signal_unsubscribe(this.handlerId);
    }
}

function init() {
    return new Extension();
}
