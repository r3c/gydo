export interface Dashboard {
	panels: Panel[],
	title: string
}

export interface Panel {
	dataSource: string
}

export interface Rendering {
	html: string
}