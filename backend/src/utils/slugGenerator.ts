import slugifyModule from "slugify";

const slugify = (slugifyModule as any).default || slugifyModule;

export const slugGenerator = (title: string) => {
	return slugify(title, {
		lower: true,
		strict: true,
		trim: true,
	});
};
