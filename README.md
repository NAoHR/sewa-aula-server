# Dokumentasi API
penjelasan singkat tentang rute-rute api yang bisa digunakan

## admin router - `/admin`
- `/tambahpaket` route untuk menambah paket menu yang nantinya dapat digunakan pada tampilan utama. Untuk menambah paket dalam route ini terdiri dari dua macam, yaitu :

    - Plain (paket yang tidak membutuhkan detail detail lain)
    ```js
        {
            "paketPlain": true, // plain memiliki nilai true
            "namaPaket": "paket 1",
            "hargaAula": 300000, 
            "deskripsi": "lorem ipsum dolor sit amet",
        }
    ```
    - paket (paket yang membutuhkan detail detail lain)

    ```js
        {
            "paketPlain" : false,
            "namaPaket" : "paket 2",
            "hargaAula" : 300000,
            "deskripsi" : "paket yang menyediakan aula saja dengan fasilitasnya serta paket daging kambing",
            "detailCatering" : {
            "hargaPerBuah" : 50000,
            "gambar" : "paket_1.jpeg",
            "detailPaketCatering" : [
                "nasi sate daging kamhbing",
                "kambing gulay",
                "telur rebus",
                "minuman (air putih)"
                ]
            }
        }
    ```
    
- `/addadmin` route untuk menambah admin, pada route ini hanya super admin yang bisa mengakses
    ```js
    {
      "username": "adminUsername",
      "password":"adminpassword",
      "role" : "admin" // bisa memilih antara super_admin / admin, lihat model 
      // lihat lebih lanjut pada model schema
    }
    ```
- `/edit/admin/:adminId` route untuk meng-edit admin, seperti mengganti username, role password, etc. hanya pemilik dari akun yang bisa merubah dan super_admin
- `/getalldata` route untuk mendapatkan semua data tanpa enkripsi detail (data plain)

- `/edit/paket/:paketid` untuk mengedit paket yang sudah ada, route ini akan menvalidasi jika adanya pemindahan dari paket plain ke yang tidak, dengan fitur ini user akan mendapatkan pesan error apabila validasi tidak terpenuhi

- `/edit/order/:orderid` untuk mengedit order yang sudah ada, route ini akan menvalidasi jika adanya pemindahan pemilihan paket. Validasi ini bertujuan untuk order dengan tipe plain tidak boleh memiliki jumlah porsi, dan untuk yang tipenya paket harus mempunyai jumlah porsi

- `/delete/paket/:paketId` untuk menghapus paket yang sudah ada, jika suatu order mempunyai keterkaitan dengan paket, maka route ini akan melempar json bahwa ada beberapa order yang terikat sehingga paket tidak bisa dihapus. paket bisa dihapus dengan menambahkan `?force=1` pada url yang kemudian membuat paket dan order yang terikat akan terhapus

- `/delete/order/:orderId` route untuk menghapus orderan jika adanya pembatalan ataupun orderan sudah selesai
