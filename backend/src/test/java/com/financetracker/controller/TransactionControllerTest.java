package com.financetracker.controller;
import com.financetracker.service.TransactionService;
import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.containsString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {
 @Autowired MockMvc mvc;
 @MockitoBean TransactionService service;
 @Test void invalidAmountReturnsBadRequest() throws Exception {
  mvc.perform(post("/api/transactions").contentType("application/json")
    .content("{\"date\":\"2026-11-17\",\"type\":\"EXPENSE\",\"category\":\"Food\",\"amount\":-5}"))
    .andExpect(status().isBadRequest());
 }
 @Test void rejectsImpossibleDate() throws Exception {
  mvc.perform(post("/api/transactions").contentType("application/json")
    .content("{\"date\":\"2026-02-30\",\"type\":\"EXPENSE\",\"category\":\"Food\",\"amount\":10.00}"))
    .andExpect(status().isBadRequest());
 }
 @Test void rejectsFractionalCents() throws Exception {
  mvc.perform(post("/api/transactions").contentType("application/json")
    .content("{\"date\":\"2026-02-28\",\"type\":\"EXPENSE\",\"category\":\"Food\",\"amount\":0.011}"))
    .andExpect(status().isBadRequest());
 }
 @Test void rejectsFractionalCentsOnUpdate() throws Exception {
  mvc.perform(put("/api/transactions/00000000-0000-0000-0000-000000000001").contentType("application/json")
    .content("{\"date\":\"2026-02-28\",\"type\":\"EXPENSE\",\"category\":\"Food\",\"amount\":1.001}"))
    .andExpect(status().isBadRequest());
 }
}
