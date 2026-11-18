package com.financetracker.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

/** Reject invalid calendar dates rather than normalizing them to another day. */
public class StrictLocalDateDeserializer extends JsonDeserializer<LocalDate> {
 private static final DateTimeFormatter FORMAT = DateTimeFormatter.ISO_LOCAL_DATE.withResolverStyle(ResolverStyle.STRICT);
 @Override public LocalDate deserialize(JsonParser parser, DeserializationContext context) throws IOException {
  String value = parser.getValueAsString();
  if (value == null) throw JsonMappingException.from(parser, "Date must be a YYYY-MM-DD string");
  try { return LocalDate.parse(value, FORMAT); }
  catch (DateTimeParseException ex) { throw JsonMappingException.from(parser, "Invalid date (expected YYYY-MM-DD)", ex); }
 }
}
