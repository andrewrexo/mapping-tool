export type Tool = 'brush' | 'eraser' | 'bucket';

const createToolState = () => {
  let currentTool = $state<Tool>('brush');

  const setCurrentTool = (tool: Tool) => {
    currentTool = tool;
  };

  return {
    get currentTool() {
      return currentTool;
    },
    setTool(tool: Tool) {
      setCurrentTool(tool);
    }
  };
};

const tools = createToolState();

export { tools };
