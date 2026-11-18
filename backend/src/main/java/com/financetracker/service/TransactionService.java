package com.financetracker.service;
import com.financetracker.exception.NotFoundException;
import com.financetracker.model.*;
import com.financetracker.storage.JsonTransactionStore;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {
 private final JsonTransactionStore store;
 public TransactionService(JsonTransactionStore store) { this.store = store; }
 public synchronized List<Transaction> list(YearMonth month, String category, String search) {
  return store.readAll().stream()
    .filter(t -> month == null || YearMonth.from(t.date()).equals(month))
    .filter(t -> category == null || category.isBlank() || t.category().equalsIgnoreCase(category))
    .filter(t -> search == null || search.isBlank() || (t.merchant()+" "+t.notes()+" "+t.category()).toLowerCase(Locale.ROOT).contains(search.toLowerCase(Locale.ROOT)))
    .sorted(Comparator.comparing(Transaction::date).reversed().thenComparing(Transaction::id))
    .toList();
 }
 public synchronized Transaction create(Transaction input) {
  Transaction created = input.withId(UUID.randomUUID());
  List<Transaction> records = store.readAll(); records.add(created); store.saveAll(records); return created;
 }
 public synchronized Transaction update(UUID id, Transaction input) {
  List<Transaction> records = store.readAll();
  for (int i=0;i<records.size();i++) if (records.get(i).id().equals(id)) {
   Transaction updated = input.withId(id); records.set(i, updated); store.saveAll(records); return updated;
  }
  throw new NotFoundException("Transaction not found");
 }
 public synchronized void delete(UUID id) {
  List<Transaction> records = store.readAll();
  if (!records.removeIf(t -> t.id().equals(id))) throw new NotFoundException("Transaction not found");
  store.saveAll(records);
 }
 public Summary summary(YearMonth month) {
  List<Transaction> records = list(month, null, null);
  BigDecimal income = total(records, Transaction.Type.INCOME);
  BigDecimal expenses = total(records, Transaction.Type.EXPENSE);
  Map<String, BigDecimal> categories = records.stream().filter(t -> t.type() == Transaction.Type.EXPENSE)
     .collect(Collectors.groupingBy(Transaction::category, TreeMap::new, Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
  Map<String, BigDecimal> daily = records.stream().filter(t -> t.type() == Transaction.Type.EXPENSE)
     .collect(Collectors.groupingBy(t -> t.date().toString(), TreeMap::new, Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
  return new Summary(income, expenses, income.subtract(expenses), categories, daily);
 }
 private BigDecimal total(List<Transaction> records, Transaction.Type type) {
  return records.stream().filter(t -> t.type() == type).map(Transaction::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
 }
}
