export const managedBySelector = `
	managedBy:employees!departments_managed_by_fkey(
		id,
		full_name,
		profiles(
			full_name,
			avatar
		)
	)
`;

export const createdBySelector = `
	createdBy:employees!departments_created_by_fkey(
		id,
		full_name,
		profiles(
			full_name,
			avatar
		)
	)
`;

export const branchSelector = `
	branch:branches!departments_branch_id_fkey(
		id,
		name,
		code,
		path,
		level
	)
`;
