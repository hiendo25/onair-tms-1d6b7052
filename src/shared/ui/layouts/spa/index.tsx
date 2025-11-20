import { Box } from "@mui/material";
import SPAHeader from "./header";
import PublicHeader from "./PublicHeader";

interface PropTypes {
    children: React.ReactNode;
    loading?: boolean;
    isPublic?: boolean;
}

export const SPALayout: React.FC<PropTypes> = async ({
    children,
    loading,
    isPublic = false
}) => {
    return (
        <>
            {isPublic ? <PublicHeader /> : <SPAHeader />}
            <Box
            >
                {children}
            </Box>
            {loading && <h1>Loading....</h1>}
        </>
    );
};
