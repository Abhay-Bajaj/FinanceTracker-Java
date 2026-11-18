package com.financetracker.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.financetracker.model.StrictLocalDateDeserializer;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record Transaction(
 UUID id,
 @NotNull @JsonFormat(pattern="yyyy-MM-dd") @JsonDeserialize(using=StrictLocalDateDeserializer.class) LocalDate date,
 @NotNull Type type,
 @NotBlank String category,
 @NotNull @DecimalMin(value="0.01") @Digits(integer=12, fraction=2) BigDecimal amount,
 String merchant,
 String notes
) {
 public enum Type { INCOME, EXPENSE }
 public Transaction withId(UUID newId) { return new Transaction(newId, date, type, category, amount, merchant, notes); }
}
