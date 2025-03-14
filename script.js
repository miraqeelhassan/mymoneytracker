// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOnWB7cYInpPguAmy7H3m4iWwRJgZ4jJQ",
    authDomain: "my-money-tracker-245aa.firebaseapp.com",
    projectId: "my-money-tracker-245aa",
    storageBucket: "my-money-tracker-245aa.firebasestorage.app",
    messagingSenderId: "458627255479",
    appId: "1:458627255479:web:0cd7f8f526efb783b19132"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const itemList = document.getElementById("itemList");
const totalAmount = document.getElementById("totalAmount");

// Authentication Logic
document.getElementById('signup').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Signup Successful!"))
        .catch(err => alert(err.message));
});

document.getElementById('login').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(err => alert(err.message));
});

document.getElementById('logout').addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        loadItems();
    } else {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
    }
});

// Money Tracker Logic
document.getElementById("addItem").addEventListener("click", () => {
    const itemName = document.getElementById("itemName").value;
    const itemPrice = document.getElementById("itemPrice").value;
    const itemDate = document.getElementById("itemDate").value;

    if (itemName && itemPrice && itemDate) {
        db.collection("expenses").add({
            name: itemName,
            price: Number(itemPrice),
            date: itemDate,
            user: auth.currentUser.uid
        }).then(() => loadItems());
    }
});

function loadItems() {
    db.collection("expenses").onSnapshot(snapshot => {
        let total = 0;
        itemList.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.user === auth.currentUser.uid) {
                total += data.price;

                itemList.innerHTML += `
                    <tr>
                        <td>${data.name}</td>
                        <td>₹${data.price}</td>
                        <td>${data.date}</td>
                        <td><button onclick="deleteItem('${doc.id}')">Delete</button></td>
                    </tr>`;
            }
        });

        totalAmount.textContent = total;
    });
}

function deleteItem(id) {
    db.collection("expenses").doc(id).delete().then(() => loadItems());
}

// PDF Export with jsPDF
document.getElementById("downloadPdf").addEventListener("click", () => {
    const doc = new jsPDF();
    doc.text("Money Tracker Report", 10, 10);

    let y = 20;
    db.collection("expenses").get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.user === auth.currentUser.uid) {
                doc.text(`${data.date}: ${data.name} - ₹${data.price}`, 10, y);
                y += 10;
            }
        });

        doc.text(`Total Spent: ₹${totalAmount.textContent}`, 10, y + 10);
        doc.save(`Money_Report_${new Date().toISOString().slice(0, 7)}.pdf`);
    });
});
