import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";

import { ReactComponent as EraserIcon } from "../assets/images/eraser.svg";
import { ReactComponent as BrushIcon } from "../assets/images/brush.svg";

const Konva = () => {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState([]);
  const [range, setRange] = useState(10);
  const isDrawing = useRef(false);
  const layerRef = useRef(null);
  const konvaDivRef = useRef(null);
  const [isActive, setIsActive] = useState("brush");
  const [konvaContainerDiv, setKonvaContainerDiv] = useState(0);

  useEffect(() => {
    setKonvaContainerDiv(konvaDivRef.current.clientWidth);
  }, [konvaDivRef.current?.clientWidth]);

  const getBackgroundSize = () => {
    return { backgroundSize: `${((range - 5) / 45) * 100}% 100%` };
  };

  // Change the cursor size as the range is increased
  const sliderHandler = (event) => {
    setRange(event.target.value);
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], size: range }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    setLines(lines.concat());
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // function used to reset the drawn lines
  const resetHandler = () => {
    layerRef.current.getLayer().clear();
    setLines([]);
  };

  // function used to select the tools
  const toolHandler = (toolType) => {
    if (toolType === "brush" || toolType === "eraser") {
      setIsActive("");
    }
    setIsActive(toolType);
    if (toolType === "eraser") {
      setTool("eraser");
    } else {
      setTool("pen");
    }
  };

  // function to stop drawning outside canvas
  const handleMouseLeave = (e) => {
    if (lines.length > 0) {
      setLines([...lines, { tool, points: [], size: range }]);
    }
  };

  // function used to stop drawing when coming inside canvas without click
  const handleMouseUpper = () => {
    isDrawing.current = false;
  };

  // used to change the mouse cursor style
  const cursorDataUrl = `url("data:image/svg+xml,%3Csvg width='${range}' height='${range}' viewBox='0 0 ${range} ${range}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${
    range / 2
  }' cy='${range / 2}' r='${
    (range - 3) / 2
  }' stroke='black' stroke-width='1'/%3E%3C/svg%3E%0A") ${range / 2} ${
    range / 2
  } , auto`;

  let konvaStage = "";
  if (document.body.clientWidth <= 768) {
    konvaStage = (
      <Stage
        width={konvaContainerDiv}
        height={300}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchLeave={handleMouseLeave}
      >
        <Layer ref={layerRef}>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#FF6347"
              strokeWidth={+line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    );
  } else {
    konvaStage = (
      <Stage
        width={konvaContainerDiv}
        height={300}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Layer ref={layerRef}>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={+line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    );
  }

  return (
    <>
      <section className="konva-container" onMouseUp={handleMouseUpper}>
        <h2>React Konva</h2>
        <div className="card">
          <div className="konva-card" ref={konvaDivRef}>
            <div
              style={{
                cursor:
                  isActive === "brush" || isActive === "eraser"
                    ? `${cursorDataUrl}`
                    : "default",
              }}
            >
              {konvaStage}
            </div>
            <div className="brush-thickness-slider">
              <div className="smaller-circle"></div>
              <input
                type="range"
                min="5"
                max="50"
                value={range}
                onChange={sliderHandler}
                style={getBackgroundSize()}
              />
              <div className="bigger-circle"></div>
            </div>
            <div className="tools">
              <button className="reset-btn" onClick={resetHandler}>
                Reset
              </button>
              <div className="tools-icon">
                <div
                  className={`editing-tool-icon ${
                    isActive === "eraser" ? "icon-active" : ""
                  }`}
                >
                  <EraserIcon onClick={() => toolHandler("eraser")} />
                </div>
                <div
                  className={`editing-tool-icon ${
                    isActive === "brush" ? "icon-active" : ""
                  }`}
                >
                  <BrushIcon onClick={() => toolHandler("brush")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Konva;
