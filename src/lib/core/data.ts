export interface NumberAttribute {
	type: "number";
}

export interface StringAttribute {
	type: "string";
}

export interface BooleanAttribute {
	type: "boolean";
}

export interface ObjectAttribute {
	attributes: Property<Attribute>[];
	type: "object";
}

export interface ArrayAttribute {
	attribute: Attribute;
	type: "array";
}

export type Attribute =
	| NumberAttribute
	| StringAttribute
	| BooleanAttribute
	| ObjectAttribute
	| ArrayAttribute;

export type Property<A extends Attribute> = A & {
	name: string;
};

export interface Schema {
	id: string;
	name: string;
	attribute: Attribute;
}

export interface DataSource {
	id: string;
	schema: string;
	initial: any;
}

export interface DataPath {
	source: string;
	path: string;
}

export interface DataBinder {
	id: string;

	input: DataPath;

	output: DataPath;
}

export interface ItemBuilder {
	items: DataPath;
}

// Matcher: Matches data against a set of rules
// Transfomer: Tansforms data from one schema to another

// Split "foo.bar..baz" -> ["foo", "bar", "baz"]
function normalizePath(path: string): string[] {
	return path.split(".").filter(Boolean);
}

// export function bindDataSources(binder: DataBinder, store: DataStore) {
// 	const inputStore = store.sources[binder.input.id];
// 	const outputStore = store.sources[binder.output.id];

// 	if (!inputStore || !outputStore) {
// 		console.warn("Missing data source for binder", binder);
// 		return () => {};
// 	}

// 	const unsubscribe = inputStore.subscribe((inputValue) => {
// 		try {
// 			const value = getProperty(inputValue, binder.input.path);
// 			outputStore.update((outputValue) =>
// 				setProperty(outputValue, value, binder.output.path)
// 			);
// 		} catch (err) {
// 			console.error("Error while binding data sources", binder, err);
// 		}
// 	});

// 	return unsubscribe;
// }

function getProperty(obj: any, path: string, parent = false): any {
	if (obj == null) return undefined;

	const type = typeof obj;

	if (type === "number" || type === "string" || type === "boolean") {
		return obj;
	}

	const parts = normalizePath(path);
	const length = parent ? parts.length - 1 : parts.length;

	if (length <= 0) return obj;
	let res: any = obj;
	for (let i = 0; i < length; i++) {
		if (res == null) return undefined;

		res = res[parts[i]];
	}

	return res;
}

function setProperty(obj: any, value: any, path: string): any {
	if (obj == null || typeof obj !== "object") {
		// Root is primitive → replace entirely
		return value;
	}

	const parts = normalizePath(path);
	if (parts.length === 0) return value;

	let cursor = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const key = parts[i];
		const nextKey = parts[i + 1];

		const isNextIndex = !isNaN(Number(nextKey)); // next step is array index
		const isIndex = !isNaN(Number(key)); // current segment is array index

		// Handle numeric index on current cursor
		if (isIndex) {
			const index = Number(key);

			if (!Array.isArray(cursor)) {
				cursor = [];
			}

			if (!cursor[index]) {
				cursor[index] = isNextIndex ? [] : {};
			}

			cursor = cursor[index];

			continue;
		}

		if (cursor[key] == null || typeof cursor[key] !== "object") {
			cursor[key] = isNextIndex ? [] : {};
		}

		cursor = cursor[key];
	}

	const lastKey = parts.at(-1)!;
	const isLastIndex = !isNaN(Number(lastKey));

	if (isLastIndex) {
		const idx = Number(lastKey);

		if (!Array.isArray(cursor))
			throw new Error(`Cannot set array index '${idx}' on non-array`);

		cursor[idx] = value;
	} else {
		cursor[lastKey] = value;
	}

	return obj;
}

export function createAttribute(attribute: Attribute): any {
	if (attribute.type === "number") {
		return 0;
	} else if (attribute.type === "string") {
		return "";
	} else if (attribute.type === "boolean") {
		return false;
	} else if (attribute.type === "array") {
		return [];
	} else {
		const obj: Record<string, any> = {};

		for (const attr of attribute.attributes) {
			const value = createAttribute(attr);

			obj[attr.name] = value;
		}

		return obj;
	}
}
