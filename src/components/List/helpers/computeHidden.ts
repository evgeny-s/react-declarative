import DisplayMode from "../../../model/DisplayMode";
import IColumn from "../../../model/IColumn";

import constraintManager from "./constraintManager";

interface IComputeHiddenParams {
    column: IColumn;
    mode: DisplayMode;
    fullWidth: number;
    idx: number;
}

export const computeHidden = ({
    fullWidth,
    column,
    mode,
    idx,
}: IComputeHiddenParams) => {
    const compute = () => {
        let field = false;
        if (mode === DisplayMode.Desktop) {
            field = !!column.desktopHidden;
        } else if (mode === DisplayMode.Tablet) {
            field = !!column.tabletHidden;
        } else if (mode === DisplayMode.Phone) {
            field = !!column.phoneHidden;
        }
        return field;
    };
    return constraintManager.memoize(`column-hidden-${fullWidth}-${idx}`, compute);
};

export default computeHidden;
