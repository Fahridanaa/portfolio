export const PROJECT_GROUPS = {
	personal: {
		index: "01",
		label: "Personal",
		title: "Personal projects",
		blurb:
			"Side builds made to learn a tool, test an idea, or scratch an itch. Mostly on the web.",
	},
	openSource: {
		index: "02",
		label: "Open source",
		title: "Open source projects",
		blurb:
			"Upstream projects I contribute to. Each detail page collects the merged pull requests.",
	},
	university: {
		index: "03",
		label: "University",
		title: "University projects",
		blurb:
			"Projects from my informatics degree at Politeknik Negeri Malang: course finals, a team build, and a research testbed.",
	},
} as const;
