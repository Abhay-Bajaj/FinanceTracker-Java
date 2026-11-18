package com.financetracker.service;
import com.financetracker.model.Transaction;
import com.financetracker.storage.JsonTransactionStore;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionServiceTest {
 @Test void addsIncomeAndExpenseToSummary() {
  JsonTransactionStore store = mock(JsonTransactionStore.class);
  List<Transaction> data = new ArrayList<>();
  when(store.readAll()).thenAnswer(inv -> new ArrayList<>(data));
  doAnswer(inv -> { data.clear(); data.addAll(inv.getArgument(0)); return null; }).when(store).saveAll(anyList());
  TransactionService service = new TransactionService(store);
  service.create(new Transaction(null, LocalDate.of(2026,11,17),Transaction.Type.INCOME,"Salary",new BigDecimal("2000.00"),"Employer",""));
  service.create(new Transaction(null, LocalDate.of(2026,11,17),Transaction.Type.EXPENSE,"Food",new BigDecimal("25.50"),"Cafe",""));
  var result = service.summary(YearMonth.of(2026,11));
  assertEquals(0, result.balance().compareTo(new BigDecimal("1974.50")));
  assertEquals(0, result.byCategory().get("Food").compareTo(new BigDecimal("25.50")));
 }
 @Test void rejectsUpdateForUnknownId() {
  JsonTransactionStore store = mock(JsonTransactionStore.class);
  when(store.readAll()).thenReturn(new ArrayList<>());
  var service = new TransactionService(store);
  assertThrows(com.financetracker.exception.NotFoundException.class, () -> service.delete(UUID.randomUUID()));
 }
}
