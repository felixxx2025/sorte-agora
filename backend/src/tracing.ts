import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { NodeSDK } from "@opentelemetry/sdk-node";

export const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || "http://localhost:4318/v1/traces",
  }),
});

sdk.start();
