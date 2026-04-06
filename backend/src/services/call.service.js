const DEFAULT_STATE = {
  robotConnected: false,
  viewerConnected: false,
  callState: "idle",
  robotConnectionId: null,
  viewerConnectionId: null,
  lastEventAt: null,
};

let state = { ...DEFAULT_STATE };

function stampState(nextState) {
  state = {
    ...nextState,
    lastEventAt: new Date().toISOString(),
  };

  return getCallState();
}

function syncCallState(nextState) {
  if (!nextState.robotConnected) {
    nextState.callState = "waiting-for-robot";
    return nextState;
  }

  if (!nextState.viewerConnected) {
    nextState.callState = "waiting-for-viewer";
    return nextState;
  }

  if (nextState.callState !== "live") {
    nextState.callState = "connecting";
  }

  return nextState;
}

function getCallState() {
  return { ...state };
}

function registerRobotConnection(connectionId) {
  return stampState(
    syncCallState({
      ...state,
      robotConnected: true,
      robotConnectionId: connectionId,
    }),
  );
}

function clearRobotConnection(connectionId) {
  if (state.robotConnectionId !== connectionId) {
    return getCallState();
  }

  return stampState(
    syncCallState({
      ...state,
      robotConnected: false,
      robotConnectionId: null,
      callState: "idle",
    }),
  );
}

function registerViewerConnection(connectionId) {
  return stampState(
    syncCallState({
      ...state,
      viewerConnected: true,
      viewerConnectionId: connectionId,
    }),
  );
}

function clearViewerConnection(connectionId) {
  if (state.viewerConnectionId !== connectionId) {
    return getCallState();
  }

  return stampState(
    syncCallState({
      ...state,
      viewerConnected: false,
      viewerConnectionId: null,
      callState: "idle",
    }),
  );
}

function setCallState(nextCallState) {
  return stampState({
    ...state,
    callState: String(nextCallState || "").trim() || "idle",
  });
}

function resetCallState() {
  state = { ...DEFAULT_STATE };
  return getCallState();
}

module.exports = {
  getCallState,
  registerRobotConnection,
  clearRobotConnection,
  registerViewerConnection,
  clearViewerConnection,
  setCallState,
  resetCallState,
};
