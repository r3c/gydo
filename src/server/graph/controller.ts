import { Dashboard, Rendering } from "./entity";
import { Router } from 'express';

const render = (dashboard: Dashboard): Rendering => {
	return {
		html: "<b>Rendered Dashboard</b>"
	};
};

export const register = (router: Router) => {
	router.post('/graph/render', async (req, res) => {
		const rendering = render(req.body as Dashboard);

		res.json(rendering);
	});
};