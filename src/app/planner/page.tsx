import { getWeeklySchedule } from "@/app/actions";
import Planner from "@/components/Planner";
import { getWeekId } from "@/lib/date-utils";

export default async function PlannerPage({
    searchParams,
}: {
    searchParams: Promise<{ week?: string }>;
}) {
    const params = await searchParams;
    const weekId = params.week || getWeekId();
    const initialSchedule = await getWeeklySchedule(weekId);

    return <Planner initialSchedule={initialSchedule} />;
}
