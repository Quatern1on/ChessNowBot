import {ComponentProps, FC, useEffect, useRef, useState} from "react";
import {Chessboard} from "react-chessboard";

export const BoardWrapper: FC<ComponentProps<typeof Chessboard>> = ({...props}) => {
    const wrapperRef = useRef<HTMLObjectElement>(null);

    const [boardWidth, setBoardWidth] = useState<number>(1);

    useEffect(() => {
        if (wrapperRef.current?.offsetHeight) {
            const resizeObserver = new ResizeObserver(() => {
                setBoardWidth(wrapperRef.current?.offsetHeight as number);
            });
            resizeObserver.observe(wrapperRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    return (
        <div ref={wrapperRef} style={{height: "100%"}}>
            <Chessboard boardWidth={boardWidth} {...props} />
        </div>
    );
};
