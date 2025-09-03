if (!global.__otelInitialized) {
  const { NodeSDK } = require("@opentelemetry/sdk-node");
  const {
    getNodeAutoInstrumentations,
  } = require("@opentelemetry/auto-instrumentations-node");
  const {
    ConsoleSpanExporter,
    SimpleSpanProcessor,
  } = require("@opentelemetry/sdk-trace-base");

  const sdk = new NodeSDK({
    // Print spans to the server console (good for PoC/demo)
    traceExporter: new ConsoleSpanExporter(),
    // Also add a SimpleSpanProcessor explicitly (some versions need it)
    spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Start without chaining .then()
  try {
    sdk.start();
    // optional: log once
    console.log("✅ OpenTelemetry initialized");
  } catch (e) {
    console.error("OTel init error:", e);
  }

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("OTel shutdown"))
      .catch(console.error);
  });

  global.__otelInitialized = true;
}
