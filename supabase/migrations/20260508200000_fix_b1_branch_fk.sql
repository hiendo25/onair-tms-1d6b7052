-- Fix B1: Add FK columns for branch/department relationships
-- Fix B2: Add unique constraints to prevent duplicate branch/department names per org

-- ============================================================
-- Step 1: Deduplicate branches (keep lowest id per org+name)
-- ============================================================
DELETE FROM public.branches a
USING public.branches b
WHERE a.id > b.id
  AND a.org_id = b.org_id
  AND a.name = b.name;

-- ============================================================
-- Step 2: Deduplicate departments (keep lowest id per org+name)
-- ============================================================
DELETE FROM public.departments a
USING public.departments b
WHERE a.id > b.id
  AND a.org_id = b.org_id
  AND a.name = b.name;

-- ============================================================
-- Step 3: Add unique constraints
-- ============================================================
ALTER TABLE public.branches
  DROP CONSTRAINT IF EXISTS uq_branches_org_name;
ALTER TABLE public.branches
  ADD CONSTRAINT uq_branches_org_name UNIQUE (org_id, name);

ALTER TABLE public.departments
  DROP CONSTRAINT IF EXISTS uq_departments_org_name;
ALTER TABLE public.departments
  ADD CONSTRAINT uq_departments_org_name UNIQUE (org_id, name);

-- ============================================================
-- Step 4: Add FK columns to departments (branch_id)
-- ============================================================
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;

-- Backfill departments.branch_id using fuzzy name match
-- departments.branch stores short names (e.g. 'Hà Nội')
-- branches.name stores full names (e.g. 'Chi nhánh Hà Nội')
UPDATE public.departments d
SET branch_id = b.id
FROM public.branches b
WHERE d.org_id = b.org_id
  AND d.branch_id IS NULL
  AND d.branch <> ''
  AND (
    b.name = d.branch
    OR b.name ILIKE '%' || d.branch || '%'
    OR d.branch ILIKE '%' || b.name || '%'
  );

-- ============================================================
-- Step 5: Add FK columns to employees (branch_id, department_id)
-- ============================================================
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- Backfill employees.branch_id from branches name match
UPDATE public.employees e
SET branch_id = b.id
FROM public.branches b
WHERE e.org_id = b.org_id
  AND e.branch_id IS NULL
  AND e.branch <> ''
  AND (
    b.name = e.branch
    OR b.name ILIKE '%' || e.branch || '%'
    OR e.branch ILIKE '%' || b.name || '%'
  );

-- Backfill employees.department_id from departments name match (exact only)
UPDATE public.employees e
SET department_id = d.id
FROM public.departments d
WHERE e.org_id = d.org_id
  AND e.department_id IS NULL
  AND e.department <> ''
  AND d.name = e.department;

-- ============================================================
-- Step 6: Add indexes for FK columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_departments_branch_id ON public.departments(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id   ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_dept_id     ON public.employees(department_id);
