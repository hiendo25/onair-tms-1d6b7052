import { TableRow, styled } from "@mui/material";

export const TableRowStyled = styled(TableRow)`
	&.table-data-row {
		td.fixed-left,
		td.fixed-right,
		th.fixed-left,
		th.fixed-right {
			position: sticky;
			&:after {
				content: "";
				position: absolute;
				width: 30px;
				height: 100%;
				top: 0;
				bottom: 0;
			}
		}

		td.fixed-left,
		th.fixed-left {
			&:after {
				right: -30px;
				box-shadow: inset 8px 0px 8px -8px rgb(0 0 0 / 10%);
			}
		}
		td.fixed-right,
		th.fixed-right {
			&:after {
				left: -30px;
				box-shadow: inset -8px 0px 8px -8px rgb(0 0 0 / 10%);
			}
		}
	}
`;
