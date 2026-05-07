export const selectCreatedBy = `
	createdBy:employees!branches_created_by_fkey(
	id,
	full_name,
	profiles(
		full_name,
		avatar
	)
)`;

export const selectManagedBy = `
	managedBy:employees!branches_managed_by_fkey(
		id,
		full_name,
		profiles(
			full_name,
			avatar
		)
	)`;
