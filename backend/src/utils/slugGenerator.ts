import slugify from "slugify";

export const slugGenerator = (title: string) => {
	return slugify(title, {
		lower: true,
		strict: true,
		trim: true,
	});
};
