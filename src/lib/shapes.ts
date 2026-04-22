import { Position, PositionData } from "../types";

type ShapeFunction = (
  members: string[],
  params: Record<string, any>,
  origin: Position,
) => PositionData[];

export const ShapeLibrary: Record<string, ShapeFunction> = {
  line: (members, params, origin) => {
    const spacing = params.spacing !== undefined ? Number(params.spacing) : 2;
    const order: number[] = params.order || members.map((_, i) => i + 1);

    let angleDeg = 0;
    if (params.angle !== undefined) {
      if (params.angle === "vertical") angleDeg = 90;
      else if (params.angle === "horizontal") angleDeg = 0;
      else if (typeof params.angle === "number") angleDeg = params.angle;
    }
    const rad = angleDeg * (Math.PI / 180);
    const result: PositionData[] = [];
    const count = order.length;

    order.forEach((memberIndex, i) => {
      const name = members[memberIndex - 1];
      if (!name)
        throw new Error(
          `存在しないメンバーインデックス(${memberIndex})が指定されました。`,
        );

      const distance = (i - (count - 1) / 2) * spacing;
      const offsetX = distance * Math.cos(rad);
      const offsetY = -distance * Math.sin(rad);
      result.push({
        name,
        position: { x: origin.x + offsetX, y: origin.y + offsetY },
      });
    });
    return result;
  },
};
