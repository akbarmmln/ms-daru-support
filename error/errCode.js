const errCode = {
  '10000': 'internal server error',
  '80001': 'data tidak ditemukan',
  '80002': 'request body not allowed',
  '80003': 'transaksi tidak diijinkan',
  '80004': 'kesalahan input data',
  '80005': 'kesalahan input data',
  '80006': 'request perubahan status tidak diijinkan',
  '80007': 'client mqtt not found or already disconnect',
};

module.exports = errCode;