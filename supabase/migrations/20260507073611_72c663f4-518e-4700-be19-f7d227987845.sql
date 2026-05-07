
-- Fix search_path on trigger fn
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

-- Restrict is_org_member execution to authenticated users
revoke execute on function public.is_org_member(uuid, text) from public, anon;
grant execute on function public.is_org_member(uuid, text) to authenticated;

-- ============== Seed branches ==============
insert into public.branches (org_id, code, name, address, phone, manager, employees) values
-- Highlands
('highlands','HN', 'Chi nhánh Hà Nội',    'Tầng 5, Capital Place, Liễu Giai, Ba Đình', '024-3555-1234','Nguyễn Văn An',412),
('highlands','HCM','Chi nhánh TP.HCM',    'Tầng 12, Bitexco, Quận 1',                  '028-3825-9999','Đỗ Quang Huy', 587),
('highlands','DN', 'Chi nhánh Đà Nẵng',   '78 Bạch Đằng, Hải Châu',                    '0236-3777-456','Lý Thị Ngọc',  156),
('highlands','CT', 'Chi nhánh Cần Thơ',   '12 Hoà Bình, Ninh Kiều',                    '0292-3666-789','Vũ Minh Đức',  64),
('highlands','HP', 'Chi nhánh Hải Phòng', '45 Lạch Tray, Ngô Quyền',                   '0225-3888-321','Hoàng Thị Hà', 48),
-- Pharmacity
('pharmacity','HN','Khu vực Hà Nội',       'Tầng 8, Discovery Complex, Cầu Giấy', '024-7300-1414','Phạm Quang Huy',1245),
('pharmacity','HCM','Khu vực TP.HCM',      'Lầu 6, Pearl Plaza, Bình Thạnh',     '028-7300-1414','Trần Thị Hương',2180),
('pharmacity','DN','Khu vực Đà Nẵng',      '234 Nguyễn Văn Linh, Hải Châu',      '0236-7300-141','Lê Quốc Bảo',   348),
('pharmacity','BD','Khu vực Bình Dương',   '456 Đại lộ Bình Dương, Thủ Dầu Một', '0274-7300-14', 'Nguyễn Hồng Vân',412),
-- Di Động Việt
('didongviet','HCM','Khu vực TP.HCM',  '123 Trần Quang Khải, Quận 1', '028-3925-1111','Phùng Tuấn Anh',420),
('didongviet','HN','Khu vực Hà Nội',   '88 Tây Sơn, Đống Đa',         '024-3576-2222','Đinh Mạnh Hùng',180),
('didongviet','DN','Khu vực Miền Trung','45 Lê Duẩn, Hải Châu',        '0236-3845-333','Vũ Đức Thịnh',   95),
-- Circle K
('circlek','HCM','Vùng TP.HCM',  'Tầng 9, Saigon Centre, Quận 1',     '028-3914-2929','Nguyễn Hoàng Long', 1850),
('circlek','HN','Vùng Hà Nội',   'Tầng 6, Capital Tower, Hoàn Kiếm',  '024-3936-1818','Phan Minh Quân',     940),
('circlek','BD','Vùng Bình Dương','67 Đại lộ Bình Dương, Thuận An',   '0274-3725-22', 'Lê Thị Diễm Thuý',   320);

-- ============== Seed departments ==============
insert into public.departments (org_id, code, name, branch, head, employees) values
-- Highlands
('highlands','DT-PT','Phòng Đào tạo & Phát triển','Hà Nội','Nguyễn Văn An',24),
('highlands','VH','Phòng Vận hành','TP.HCM','Đỗ Quang Huy',145),
('highlands','MB','Khu vực Miền Bắc','Hà Nội','Hoàng Thị Hà',412),
('highlands','MT','Khu vực Miền Trung','Đà Nẵng','Lý Thị Ngọc',156),
('highlands','MN','Khu vực Miền Nam','TP.HCM','Đỗ Quang Huy',587),
('highlands','MKT','Phòng Marketing','TP.HCM','Lê Hoàng Cường',18),
('highlands','HR','Phòng Nhân sự','Hà Nội','Bùi Thị Lan',14),
-- Pharmacity
('pharmacity','DT-YK','Phòng Đào tạo Y khoa','Hà Nội','Phạm Quang Huy',32),
('pharmacity','VH','Phòng Vận hành Nhà thuốc','TP.HCM','Trần Thị Hương',215),
('pharmacity','QL-CL','Phòng Quản lý Chất lượng','TP.HCM','Lê Quốc Bảo',28),
('pharmacity','MB','Khu vực Miền Bắc','Hà Nội','Phạm Quang Huy',1245),
('pharmacity','MN','Khu vực Miền Nam','TP.HCM','Trần Thị Hương',2180),
('pharmacity','MKT','Phòng Marketing & CSKH','TP.HCM','Đặng Thu Trang',24),
-- Di Động Việt
('didongviet','DT','Phòng Đào tạo','TP.HCM','Phùng Tuấn Anh',12),
('didongviet','BH','Phòng Bán hàng','TP.HCM','Nguyễn Quốc Vinh',420),
('didongviet','KT','Phòng Kỹ thuật','TP.HCM','Trần Văn Phú',86),
('didongviet','MKT','Phòng Marketing','TP.HCM','Lê Hoàng Yến',18),
-- Circle K
('circlek','DT','Phòng Đào tạo','TP.HCM','Nguyễn Hoàng Long',22),
('circlek','VH','Phòng Vận hành cửa hàng','TP.HCM','Phan Minh Quân',1850),
('circlek','MD','Phòng Merchandising','TP.HCM','Trần Quốc Khánh',45),
('circlek','HR','Phòng Nhân sự','TP.HCM','Lê Thị Diễm Thuý',38);

-- ============== Seed roles ==============
insert into public.org_roles (org_id, code, name, description, permissions, users) values
-- Highlands
('highlands','SUPER_ADMIN','Quản trị hệ thống','Toàn quyền trên toàn bộ hệ thống LMS Highlands',64,2),
('highlands','TRAINING_MANAGER','Trưởng phòng Đào tạo','Quản trị toàn bộ chương trình đào tạo nội bộ',48,4),
('highlands','TRAINER','Chuyên viên Đào tạo','Soạn bài, chấm bài, quản lý lớp được phân',22,18),
('highlands','AREA_SUPERVISOR','Giám sát vùng','Theo dõi tiến độ học tập của khu vực phụ trách',16,12),
('highlands','STORE_MANAGER','Quản lý cửa hàng','Theo dõi đào tạo nhân viên cửa hàng',12,215),
('highlands','EMPLOYEE','Nhân viên cửa hàng','Tham gia học tập và làm bài kiểm tra',6,1240),
-- Pharmacity
('pharmacity','SUPER_ADMIN','Quản trị hệ thống','Toàn quyền trên hệ thống LMS Pharmacity',64,3),
('pharmacity','TRAINING_MANAGER','Trưởng phòng Đào tạo Y khoa','Quản trị chương trình đào tạo y khoa',48,5),
('pharmacity','TRAINER','Giảng viên Y khoa','Biên soạn nội dung, chấm bài, quản lý lớp',22,32),
('pharmacity','AREA_SUPERVISOR','Giám sát vùng','Theo dõi tiến độ đào tạo theo vùng',16,18),
('pharmacity','STORE_MANAGER','Quản lý nhà thuốc','Quản lý đào tạo dược sĩ tại nhà thuốc',12,1100),
('pharmacity','EMPLOYEE','Dược sĩ / Nhân viên','Tham gia học tập và đánh giá',6,4185),
-- Di Động Việt
('didongviet','SUPER_ADMIN','Quản trị hệ thống','Toàn quyền hệ thống LMS Di Động Việt',64,2),
('didongviet','TRAINING_MANAGER','Trưởng phòng Đào tạo','Quản lý chương trình đào tạo',48,2),
('didongviet','TRAINER','Chuyên viên Đào tạo','Soạn bài, chấm bài',22,8),
('didongviet','STORE_MANAGER','Cửa hàng trưởng','Quản lý nhân viên cửa hàng',12,80),
('didongviet','EMPLOYEE','Nhân viên cửa hàng','Tham gia học tập',6,695),
-- Circle K
('circlek','SUPER_ADMIN','Quản trị hệ thống','Toàn quyền hệ thống LMS Circle K',64,3),
('circlek','TRAINING_MANAGER','Trưởng phòng Đào tạo','Quản lý chương trình đào tạo cửa hàng tiện lợi',48,4),
('circlek','TRAINER','Chuyên viên Đào tạo','Soạn bài, chấm bài, theo dõi học viên',22,15),
('circlek','AREA_SUPERVISOR','Giám sát vùng','Theo dõi vùng được phân công',16,22),
('circlek','STORE_MANAGER','Cửa hàng trưởng','Quản lý đào tạo nhân viên cửa hàng',12,450),
('circlek','EMPLOYEE','Nhân viên cửa hàng','Tham gia học tập, làm bài',6,2630);
