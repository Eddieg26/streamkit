export interface ColorBackground {
	color: string;
	type: "color";
}

export interface ImageBackground {
	url: string;
	type: "image";
}

export interface LinearGradientBackground {
	colors: { color: string; position: number }[];
	angle: number;
	type: "linear-gradient";
}

export interface RadialGradientBackground {
	type: "radial-gradient";
}

export type Background =
	| ColorBackground
	| ImageBackground
	| LinearGradientBackground
	| RadialGradientBackground;

export type Alignment = "start" | "center" | "end";

export interface Stroke {
	width: number;
	color: string;
	style: "solid" | "dashed";
}

export interface Edges {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
}

type Property<T> = T extends object
	? { [K in keyof T]: Property<T[K]> }
	: T | string;

export interface BaseNode {
	id: string;

	type: string;

	alignment?: Property<
		Partial<{
			horizontal: Alignment;
			vertical: Alignment;
		}>
	>;

	background?: Property<Background>[];

	stroke?: Property<Stroke>;

	corners?: Property<number | Edges>;

	padding?: Property<number | Edges>;

	margins?: Property<number | Edges>;

	opacity?: Property<number>;

	rotation?: Property<number>;
}

export interface Container extends BaseNode {
	type: "container";

	content_alignment?: Property<
		Partial<{
			horizontal: Alignment;
			vertical: Alignment;
		}>
	>;

	children?: BaseNode[];
}

export interface Image extends BaseNode {
	type: "image";

	content_alignment?: Property<
		Partial<{
			horizontal: Alignment;
			vertical: Alignment;
		}>
	>;

	url?: string;

	scale?: "none" | "fill" | "fit" | "stretch";
}

export interface Video extends BaseNode {
	type: "video";

	url?: string;

	scale?: "none" | "fill" | "fit";
}

export interface Text extends BaseNode {
	type: "text";

	text?: string;
}

export interface Button extends BaseNode {
	type: "button";

	content_alignment?: Property<Alignment>;

	children?: BaseNode[];
}
