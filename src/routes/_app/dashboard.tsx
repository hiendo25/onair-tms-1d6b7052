import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle, BookOpen, ClipboardCheck, Trophy, Clock, Award, Star,
  Crown, Flame, GraduationCap, CheckCircle2, PlayCircle, Medal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/PageContainer";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  component: StudentDashboard,
});

// ─── Mock data: Highlands Coffee context ───────────────────────────────
const todayTasks = [
  {
    id: 1,
    title: "Quy trình pha chế Phin Sữa Đá",
    type: "lesson" as const,
    deadline: "Hôm nay, 18:00",
    urgent: true,
    path: "/my-learning-paths",
  },
  {
    id: 2,
    title: "Kiểm tra: An toàn vệ sinh thực phẩm",
    type: "quiz" as const,
    deadline: "Hôm nay, 22:00",
    urgent: true,
    path: "/my-assignments",
  },
  {
    id: 3,
    title: "Bài học: Đón tiếp khách hàng VIP",
    type: "lesson" as const,
    deadline: "Ngày mai",
    urgent: false,
    path: "/my-learning-paths",
  },
];

const myLearningPath = {
  name: "Lộ trình Barista cấp 2",
  progress: 65,
  totalLessons: 24,
  completedLessons: 16,
};

const personalStats = {
  completedCourses: 12,
  quizzesTaken: 28,
  averageScore: 8.7,
  hoursLearned: 47,
};

const xpData = {
  current: 1820,
  rank: "Cao thủ",
  nextRank: "Huyền thoại",
  nextRankAt: 3000,
  prevRankAt: 1500,
};

const leaderboard = [
  { rank: 1, name: "Nguyễn Thu Hà", xp: 3240, isMe: false, branch: "Highlands Nguyễn Huệ" },
  { rank: 2, name: "Trần Minh Khoa", xp: 2890, isMe: false, branch: "Highlands Nguyễn Huệ" },
  { rank: 3, name: "Bạn", xp: 1820, isMe: true, branch: "Highlands Nguyễn Huệ" },
  { rank: 4, name: "Lê Phương Anh", xp: 1560, isMe: false, branch: "Highlands Nguyễn Huệ" },
  { rank: 5, name: "Phạm Quốc Tuấn", xp: 1340, isMe: false, branch: "Highlands Nguyễn Huệ" },
];

const recommendedCourses = [
  { id: 1, title: "Pha chế Cold Brew chuẩn vị", progress: 35, thumb: "from-amber-400 to-orange-500" },
  { id: 2, title: "Kỹ năng Upsell tại quầy", progress: 0, thumb: "from-rose-400 to-red-500" },
  { id: 3, title: "Vệ sinh máy Espresso đúng cách", progress: 70, thumb: "from-emerald-400 to-teal-500" },
];

// ─── Component ─────────────────────────────────────────────────────────
function StudentDashboard() {
  return (
    <PageContainer title="Tổng quan" breadcrumbs={[{ title: "Tổng quan" }]}>
      <TodayTasksSection />
      <ProgressSection />
      <AchievementSection />
      <RecommendedSection />
    </PageContainer>
  );
}

// ─── Section 1: Today's tasks ──────────────────────────────────────────
function TodayTasksSection() {
  const hasTasks = todayTasks.length > 0;
  const hasUrgent = todayTasks.some((t) => t.urgent);

  return (
    <Card
      className={
        hasUrgent
          ? "border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-amber-50"
          : ""
      }
    >
      <CardHeader className="flex flex-row items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            hasUrgent ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Việc cần làm hôm nay</CardTitle>
        {hasUrgent && (
          <Badge variant="destructive" className="ml-2">
            {todayTasks.filter((t) => t.urgent).length} việc gấp
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
            <p className="text-base font-medium">Bạn đã hoàn thành tất cả hôm nay 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">Quay lại vào ngày mai nhé!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => {
              const Icon = task.type === "quiz" ? ClipboardCheck : BookOpen;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    task.urgent ? "border-orange-200 bg-white" : "border-slate-200 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      task.urgent ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p
                      className={`text-xs flex items-center gap-1 mt-0.5 ${
                        task.urgent ? "text-orange-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {task.deadline}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className={
                      task.urgent
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                  >
                    <Link to={task.path}>{task.type === "quiz" ? "Làm bài" : "Học ngay"}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section 2: Progress ───────────────────────────────────────────────
function ProgressSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Lộ trình đang học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">{myLearningPath.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {myLearningPath.completedLessons}/{myLearningPath.totalLessons} bài học hoàn thành
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className="font-semibold text-blue-600">{myLearningPath.progress}%</span>
            </div>
            <Progress value={myLearningPath.progress} className="h-2.5" />
          </div>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link to="/my-learning-paths">
              <PlayCircle className="h-4 w-4 mr-2" />
              Tiếp tục học
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Thống kê cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              icon={GraduationCap}
              label="Khóa hoàn thành"
              value={personalStats.completedCourses}
              color="bg-blue-50 text-blue-600"
            />
            <StatBox
              icon={ClipboardCheck}
              label="Bài kiểm tra"
              value={personalStats.quizzesTaken}
              color="bg-purple-50 text-purple-600"
            />
            <StatBox
              icon={Star}
              label="Điểm trung bình"
              value={personalStats.averageScore}
              color="bg-amber-50 text-amber-600"
            />
            <StatBox
              icon={Clock}
              label="Giờ học tích lũy"
              value={`${personalStats.hoursLearned}h`}
              color="bg-emerald-50 text-emerald-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({
  icon: Icon, label, value, color,
}: { icon: typeof Star; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${color} mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Section 3: Achievements & Leaderboard ─────────────────────────────
function AchievementSection() {
  const xpToNext = xpData.nextRankAt - xpData.current;
  const progressInRank =
    ((xpData.current - xpData.prevRankAt) / (xpData.nextRankAt - xpData.prevRankAt)) * 100;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* XP & Rank */}
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-amber-300" />
            Thành tích của tôi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-amber-900">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-purple-200">Hạng hiện tại</p>
              <p className="text-2xl font-bold">{xpData.rank}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-purple-200">Tổng XP</p>
              <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                <Flame className="h-5 w-5 text-amber-300" />
                {xpData.current.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">Lên hạng {xpData.nextRank}</span>
              <span className="font-semibold">Còn {xpToNext.toLocaleString()} XP</span>
            </div>
            <Progress value={progressInRank} className="h-2 bg-purple-900" />
          </div>
          <Button asChild variant="secondary" className="w-full bg-white/15 hover:bg-white/25 text-white border-0">
            <Link to="/gamification">
              <Award className="h-4 w-4 mr-2" />
              Xem huy hiệu
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-500" />
            Top học viên — Highlands Nguyễn Huệ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {leaderboard.map((u) => (
              <div
                key={u.rank}
                className={`flex items-center gap-3 rounded-lg p-2.5 ${
                  u.isMe ? "bg-blue-50 border border-blue-200" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    u.rank === 1
                      ? "bg-amber-400 text-amber-900"
                      : u.rank === 2
                      ? "bg-slate-300 text-slate-800"
                      : u.rank === 3
                      ? "bg-orange-300 text-orange-900"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {u.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${u.isMe ? "font-bold text-blue-700" : "font-medium"}`}>
                    {u.name} {u.isMe && <span className="text-xs">(bạn)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Flame className="h-3.5 w-3.5" />
                  {u.xp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section 4: Recommended courses ────────────────────────────────────
function RecommendedSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Khóa học gợi ý
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedCourses.map((c) => (
            <div key={c.id} className="rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-32 bg-gradient-to-br ${c.thumb} flex items-center justify-center`}>
                <BookOpen className="h-12 w-12 text-white/80" />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                  {c.title}
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {c.progress === 0 ? "Chưa bắt đầu" : "Đang học"}
                    </span>
                    <span className="font-semibold">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="h-1.5" />
                </div>
                <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/my-online-courses">
                    {c.progress === 0 ? "Bắt đầu" : "Tiếp tục"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
