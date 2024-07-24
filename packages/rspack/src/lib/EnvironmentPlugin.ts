/**
 * The following code is modified based on
 * https://github.com/webpack/webpack/blob/4b4ca3b/lib/EnvironmentPlugin.js
 *
 * MIT Licensed
 * Author Tobias Koppers @sokra
 * Copyright (c) JS Foundation and other contributors
 * https://github.com/webpack/webpack/blob/main/LICENSE
 */

import { DefinePlugin } from "../builtin-plugin";
import WebpackError from "./WebpackError";

import type { Compiler } from "../Compiler";

// Waiting to adapt > import("./DefinePlugin").CodeValue
type CodeValue = any;

class EnvironmentPlugin {
	keys: string[];
	defaultValues: Record<string, string>;

	constructor(...keys: string[] | [Record<string, string> | string]) {
		if (keys.length === 1 && Array.isArray(keys[0])) {
			this.keys = keys[0];
			this.defaultValues = {};
		} else if (keys.length === 1 && typeof keys[0] === "object") {
			this.keys = Object.keys(keys[0]);
			this.defaultValues = keys[0];
		} else {
			this.keys = keys as string[];
			this.defaultValues = {};
		}
	}

	/**
	 * Apply the plugin
	 * @param compiler the compiler instance
	 * @returns
	 */
	apply(compiler: Compiler) {
		const definitions: Record<string, CodeValue> = {};
		for (const key of this.keys) {
			const value =
				process.env[key] !== undefined
					? process.env[key]
					: this.defaultValues[key];

			if (value === undefined) {
				compiler.hooks.thisCompilation.tap("EnvironmentPlugin", compilation => {
					const error = new WebpackError(
						`EnvironmentPlugin - ${key} environment variable is undefined.\n\n` +
							"You can pass an object with default values to suppress this warning.\n" +
							"See https://webpack.js.org/plugins/environment-plugin for example."
					);

					error.name = "EnvVariableNotDefinedError";
					compilation.errors.push(error);
				});
			}

			definitions[`process.env.${key}`] =
				value === undefined ? "undefined" : JSON.stringify(value);
		}
		new DefinePlugin(definitions).apply(compiler);
	}
}

export { EnvironmentPlugin };
