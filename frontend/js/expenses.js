// const API = "http://localhost:5000";

/* ------------------------------------------------------------------
   SAVE EXPENSE  (for add-expense.html)
------------------------------------------------------------------ */
async function saveExpense() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login first");

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    const res = await fetch(`${API}/expenses/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.id,
            amount,
            category,
            date,
            note
        })
    });

    const data = await res.json();
    alert(data.message || "Expense saved!");

    // clear form
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
}

/* ------------------------------------------------------------------
   LOAD EXPENSES  (for view-expenses.html)
------------------------------------------------------------------ */

let allExpenses = []; // Store all expenses for filtering

async function loadExpenses() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login first");

    const res = await fetch(`${API}/expenses/all/${user.id}`);
    const data = await res.json();
    
    allExpenses = data; // Store for filtering
    displayExpenses(data);
}

function displayExpenses(expenses) {
    let rows = "";
    expenses.forEach(exp => {
        rows += `
        <tr>
            <td>₹${exp.amount}</td>
            <td>${exp.category}</td>
            <td>${exp.date}</td>
            <td>${exp.note || ""}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editExpense(${exp.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("table-body").innerHTML = rows || '<tr><td colspan="5" style="text-align:center;">No expenses found</td></tr>';
}

function applyFilters() {
    const categoryFilter = document.getElementById("filter-category").value;
    const dateFilter = document.getElementById("filter-date").value;
    const searchFilter = document.getElementById("filter-search").value.toLowerCase();

    let filtered = allExpenses.filter(exp => {
        const matchCategory = !categoryFilter || exp.category === categoryFilter;
        const matchDate = !dateFilter || exp.date === dateFilter;
        const matchSearch = !searchFilter || (exp.note && exp.note.toLowerCase().includes(searchFilter));
        
        return matchCategory && matchDate && matchSearch;
    });

    displayExpenses(filtered);
}

async function deleteExpense(id) {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    const res = await fetch(`${API}/expenses/delete/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();
    alert(data.message || "Deleted");

    loadExpenses(); // refresh table
}


function editExpense(id) {
    const row = event.target.closest("tr");
    const amount = row.children[0].innerText.replace("₹", "");
    const category = row.children[1].innerText;
    const date = row.children[2].innerText;
    const note = row.children[3].innerText;

    document.getElementById("edit-id").value = id;
    document.getElementById("edit-amount").value = amount;
    document.getElementById("edit-category").value = category;
    document.getElementById("edit-date").value = date;
    document.getElementById("edit-note").value = note;

    document.getElementById("edit-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("edit-modal").style.display = "none";
}


async function saveEdit() {
    const id = document.getElementById("edit-id").value;

    const updated = {
        amount: document.getElementById("edit-amount").value,
        category: document.getElementById("edit-category").value,
        date: document.getElementById("edit-date").value,
        note: document.getElementById("edit-note").value
    };

    const res = await fetch(`${API}/expenses/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    const data = await res.json();
    alert(data.message || "Updated");

    closeModal();
    loadExpenses();
}


// Run when view-expenses.html loads
if (window.location.pathname.includes("view-expenses.html")) {
    window.onload = loadExpenses;
}
