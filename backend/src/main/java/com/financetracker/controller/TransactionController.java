package com.financetracker.controller;
import com.financetracker.model.*;
import com.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {
 private final TransactionService service;
 public TransactionController(TransactionService service) { this.service = service; }
 @GetMapping("/transactions")
 public List<Transaction> list(@RequestParam(required=false) YearMonth month, @RequestParam(required=false) String category, @RequestParam(required=false) String search) {
  return service.list(month, category, search);
 }
 @PostMapping("/transactions")
 public ResponseEntity<Transaction> create(@Valid @RequestBody Transaction input) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(input)); }
 @PutMapping("/transactions/{id}")
 public Transaction update(@PathVariable UUID id, @Valid @RequestBody Transaction input) { return service.update(id, input); }
 @DeleteMapping("/transactions/{id}")
 public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
 @GetMapping("/summary")
 public Summary summary(@RequestParam(required=false) YearMonth month) { return service.summary(month); }
 @GetMapping(value="/export", produces="text/csv")
 public ResponseEntity<byte[]> export(@RequestParam(required=false) YearMonth month) {
  StringBuilder csv = new StringBuilder("Date,Type,Category,Amount,Merchant,Notes\r\n");
  for (Transaction t : service.list(month, null, null)) {
   csv.append(String.join(",", escape(t.date().toString()), escape(t.type().name()), escape(t.category()), escape(t.amount().toPlainString()), escape(t.merchant()), escape(t.notes()))).append("\r\n");
  }
  return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=finance-transactions.csv").body(csv.toString().getBytes(StandardCharsets.UTF_8));
 }
 private String escape(String s) {
  if (s == null) s="";
  // Prevent spreadsheet software from executing CSV formulas from user-entered text.
  if (!s.isEmpty() && "=+-@".indexOf(s.charAt(0)) >= 0) s="'"+s;
  return "\""+s.replace("\"","\"\"")+"\"";
 }
}
