import {FC, useState} from "react";
import * as ChessboardTypes from "react-chessboard/dist/chessboard/types";
import {PromotionPieceOption} from "react-chessboard/dist/chessboard/types";

import {Color, PieceSymbol, Square} from "@/GameClient/DataModel";
import {ClientRoom, GameClient, PossibleMove} from "@/GameClient/GameClient";
import {BoardWrapper} from "@/GameView/pages/GamePage/UI/Board/BoardWrapper";

export interface BoardProps {
    room: ClientRoom;
    makingMove: boolean;
    gameClient: GameClient;
}

const MOVE_FROM_SQUARE_STYLE = {
    background: "rgba(255, 255, 0, 0.4)",
};

const OPTION_SQUARE_STYLE = {
    background: "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
};

const OPTION_BEAT_SQUARE_STYLE = {
    background: "radial-gradient(circle, rgba(201, 18, 9, 0.4) 70%, transparent 70%)",
};

const LAST_MOVE_SQUARE_STYLE = {
    background: "rgba(255, 180, 0, 0.4)",
};

const CHECK_SQUARE_STYLE = {
    background: "radial-gradient(circle, rgba(201, 18, 9, 1) 30%, transparent 75%)",
};

export const Board: FC<BoardProps> = ({room, makingMove, gameClient}) => {
    const [moveFrom, setMoveFrom] = useState<ChessboardTypes.Square>();
    const [possibleMoves, setPossibleMoves] = useState<PossibleMove[]>([]);
    const [promotionToSquare, setPromotionToSquare] = useState<ChessboardTypes.Square>();

    const myColor = room.me.state.color;
    const turn = room.gameState.turn;
    const canMove: boolean = myColor === turn && !makingMove;

    const idDraggablePiece = ({piece}: {piece: ChessboardTypes.Piece}): boolean => {
        return canMove && piece.startsWith(myColor as string);
    };

    const highlightMoves = (square: ChessboardTypes.Square) => {
        const possibleMoves = gameClient.getPossibleMoves(square as Square);
        setMoveFrom(square as Square);
        setPossibleMoves(possibleMoves);
    };

    const clearHighlight = () => {
        setMoveFrom(undefined);
        setPossibleMoves([]);
    };

    const onSquareClick = (square: ChessboardTypes.Square): void => {
        if (!canMove) {
            return;
        }

        const possibleMove = possibleMoves.find((p) => p.to === square);

        if (possibleMove) {
            if (possibleMove.promotion) {
                setPromotionToSquare(square);
            } else {
                gameClient.makeMove({from: moveFrom! as Square, to: square as Square});
                clearHighlight();
            }
        } else {
            if (gameClient.getPieceColor(square as Square) !== room.me.state.color || square === moveFrom) {
                clearHighlight();
            } else {
                highlightMoves(square);
            }
        }
    };

    const onPieceDragBegin = (piece: ChessboardTypes.Piece, sourceSquare: Square) => {
        highlightMoves(sourceSquare);
    };

    const onPieceDrop = (sourceSquare: ChessboardTypes.Square, targetSquare: ChessboardTypes.Square): boolean => {
        const possibleMove = possibleMoves.find((p) => p.to === targetSquare);
        if (possibleMove && possibleMove.promotion) {
            setPromotionToSquare(targetSquare);
            return true;
        } else {
            clearHighlight();
            return gameClient.makeMove({from: moveFrom! as Square, to: targetSquare as Square});
        }
    };

    const onPromotionPieceSelect = (piece?: PromotionPieceOption) => {
        if (piece) {
            clearHighlight();
            const promotionPiece = piece[1].toLowerCase() as PieceSymbol;
            return gameClient.makeMove({
                from: moveFrom! as Square,
                to: promotionToSquare as Square,
                promotion: promotionPiece,
            });
        }

        setPromotionToSquare(undefined);
        return false;
    };

    const moveFromSquareStyle = {};
    if (moveFrom) {
        moveFromSquareStyle[moveFrom] = MOVE_FROM_SQUARE_STYLE;
    }

    const optionSquareStyles = {};
    for (const possibleMove of possibleMoves) {
        const color = gameClient.getPieceColor(possibleMove.to as Square);

        if (color && color === GameClient.swapColor(room.me.state.color!)) {
            optionSquareStyles[possibleMove.to] = OPTION_BEAT_SQUARE_STYLE;
        } else {
            optionSquareStyles[possibleMove.to] = OPTION_SQUARE_STYLE;
        }
    }

    const lastMoveSquareStyles = {};
    if (room.gameState.lastMove) {
        const lastMove = room.gameState.lastMove;

        lastMoveSquareStyles[lastMove.from] = LAST_MOVE_SQUARE_STYLE;
        lastMoveSquareStyles[lastMove.to] = LAST_MOVE_SQUARE_STYLE;
    }

    const checkSquareStyle = {};
    const checkKingSquare = gameClient.getCheck();
    if (checkKingSquare) {
        checkSquareStyle[checkKingSquare] = CHECK_SQUARE_STYLE;
    }

    return (
        <BoardWrapper
            position={room.gameState.fen}
            boardOrientation={room.me.state.color === Color.Black ? "black" : "white"}
            onSquareClick={onSquareClick}
            isDraggablePiece={idDraggablePiece}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDrop={onPieceDrop}
            showPromotionDialog={Boolean(promotionToSquare)}
            promotionToSquare={promotionToSquare}
            onPromotionPieceSelect={onPromotionPieceSelect}
            onPromotionCheck={() => false}
            customSquareStyles={{
                ...lastMoveSquareStyles,
                ...checkSquareStyle,
                ...moveFromSquareStyle,
                ...optionSquareStyles,
            }}
        />
    );
};
