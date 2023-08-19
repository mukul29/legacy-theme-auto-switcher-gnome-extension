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

/* exported Extension */
import Gio from 'gi://Gio';

const DEFAULT_SCHEME_NAME = 'default';
const LIGHT_SCHEME_NAME = 'prefer-light';
const DARK_SCHEME_NAME = 'prefer-dark';

export default class Extension {
    handleThemeChange = (theme_name) => {
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

    handleCurrentTheme = () => {
        let value = this.schema.get_string('color-scheme');
        this.handleThemeChange(value);
    }

    enable() {
        this.schema = Gio.Settings.new('org.gnome.desktop.interface');
        this.id = this.schema.connect('changed::color-scheme', () => {
            this.handleCurrentTheme();
        });
        this.handleCurrentTheme();
    }

    disable() {
        if (this.schema) {
            if (this.id) {
                this.schema.disconnect(this.id)
                this.id = null
            }
            this.schema = null
        }
    }
}
