package com.financetracker.storage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Component
public class JsonTransactionStore {
 private final Path path;
 private final ObjectMapper mapper;
 public JsonTransactionStore(@Value("${finance.data.file}") String filename, ObjectMapper mapper) {
  this.path = Path.of(filename).toAbsolutePath(); this.mapper = mapper;
 }
 public synchronized List<Transaction> readAll() {
  if (!Files.exists(path)) return new ArrayList<>();
  try { return new ArrayList<>(mapper.readValue(path.toFile(), new TypeReference<List<Transaction>>(){})); }
  catch (IOException e) { throw new IllegalStateException("Could not read saved transactions", e); }
 }
 public synchronized void saveAll(List<Transaction> transactions) {
  try {
   Files.createDirectories(path.getParent());
   Path tmp = Files.createTempFile(path.getParent(), "transactions-", ".tmp");
   try {
    mapper.writerWithDefaultPrettyPrinter().writeValue(tmp.toFile(), transactions);
    try { Files.move(tmp, path, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING); }
    catch (AtomicMoveNotSupportedException e) { Files.move(tmp, path, StandardCopyOption.REPLACE_EXISTING); }
   } finally { Files.deleteIfExists(tmp); }
  } catch (IOException e) { throw new IllegalStateException("Could not save transactions", e); }
 }
}
