"use client";

import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { Tab, Tabs } from "@mui/material";
import ClassRoomTab from "./ClassRoomTab";
import ELearningTab from "./ELearningTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import AirplayOutlinedIcon from '@mui/icons-material/AirplayOutlined';


type TabValue = "ClassRoomTab" | "ElearningTab";

const DEFAULT_TAB: TabValue = "ClassRoomTab";
const TAB_QUERY_KEY = "tab";


const MyClassSection = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const tabFromQuery = useMemo<TabValue>(() => {
        const queryValue = searchParams.get(TAB_QUERY_KEY);
        return queryValue === "ElearningTab" ? "ElearningTab" : DEFAULT_TAB;
    }, [searchParams]);

    const [value, setValue] = useState<TabValue>(tabFromQuery);

    useEffect(() => {
        setValue((prev) => (prev === tabFromQuery ? prev : tabFromQuery));
    }, [tabFromQuery]);

    const syncQueryWithTab = (nextValue: TabValue) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextValue === DEFAULT_TAB) {
            params.delete(TAB_QUERY_KEY);
        } else {
            params.set(TAB_QUERY_KEY, nextValue);
        }

        const queryString = params.toString();
        const nextPath = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(nextPath, { scroll: false });
    };

    const handleChange = (_event: SyntheticEvent, newValue: string) => {
        const nextValue = newValue as TabValue;

        if (nextValue === value) {
            return;
        }

        setValue(nextValue);
        syncQueryWithTab(nextValue);
    };

    const isClassRoomTabActive = value === "ClassRoomTab";
    const isElearningTabActive = value === "ElearningTab";

    return (
        <TabContext value={value}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                className="rounded-2xl bg-white px-4 py-3 mb-4"
            >
                <Tab
                    value="ClassRoomTab"
                    label="Lớp học trực tiếp"
                    iconPosition="start"
                    icon={<TvOutlinedIcon className="w-6 h-6" />}
                    className="text-xs font-semibold p-0 mr-6 min-h-12"
                />
                <Tab
                    value="ElearningTab"
                    label="Môn học eLearning"
                    iconPosition="start"
                    icon={<AirplayOutlinedIcon className="w-6 h-6" />}
                    className="text-xs font-semibold p-0 min-h-12"
                />
            </Tabs>

            <TabPanel value="ClassRoomTab" className="p-0">
                <ClassRoomTab isActive={isClassRoomTabActive} />
            </TabPanel>

            <TabPanel value="ElearningTab" className="p-0">
                <ELearningTab isActive={isElearningTabActive} />
            </TabPanel>
        </TabContext>
    )
};

export default MyClassSection;
