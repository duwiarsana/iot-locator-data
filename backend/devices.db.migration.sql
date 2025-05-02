-- Migration to add MQTT username and password fields to devices table
ALTER TABLE devices ADD COLUMN mqttUsername TEXT;
ALTER TABLE devices ADD COLUMN mqttPassword TEXT;
