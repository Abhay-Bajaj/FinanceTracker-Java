package com.financetracker.model;
import java.math.BigDecimal;
import java.util.Map;
public record Summary(BigDecimal income, BigDecimal expenses, BigDecimal balance, Map<String, BigDecimal> byCategory, Map<String, BigDecimal> dailyExpenses) {}
