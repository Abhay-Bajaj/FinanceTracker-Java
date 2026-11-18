package com.financetracker.exception;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.util.Map;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(NotFoundException.class)
 public ResponseEntity<Map<String, String>> missing(NotFoundException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage())); }
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException ex) {
  String message = ex.getBindingResult().getFieldErrors().stream().findFirst().map(e -> e.getField()+": "+e.getDefaultMessage()).orElse("Invalid request");
  return ResponseEntity.badRequest().body(Map.of("error", message));
 }
 @ExceptionHandler(HttpMessageNotReadableException.class)
 public ResponseEntity<Map<String, String>> malformed(HttpMessageNotReadableException ex) { return ResponseEntity.badRequest().body(Map.of("error", "Invalid JSON, date, or transaction type")); }
 @ExceptionHandler(IllegalArgumentException.class)
 public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
}
