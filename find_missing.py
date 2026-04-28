
import re

user_message = """
(2012)
https://drive.google.com/file/d/1YK0r7P5eNNGeYZKDtDcfj9TiDA-iGzXm/view?usp=drive_link, https://drive.google.com/file/d/1kUkelBSyvC6BBznyMxvRRILFhpdcLifw/view?usp=drive_link

(2014)
https://drive.google.com/file/d/1u3oQUGbX4HSpTsrBmgSFFNNlADsmEMsI/view?usp=drive_link, https://drive.google.com/file/d/1Br1DI2H_8MvTBmfK6UkBv3qMnLVT2MV-/view?usp=drive_link, https://drive.google.com/file/d/1EFsxJ_71kfXkmynZiFYJO-oUORFnWPZF/view?usp=drive_link

(2015)
https://drive.google.com/file/d/1fBScc4bgmXo0OrpUqcg6pi6A2qGsnbWh/view?usp=drive_link, https://drive.google.com/file/d/1L7fqrZ_NnvGuOntIPkb7eEFHdspcOkQx/view?usp=drive_link, https://drive.google.com/file/d/16gImhwFaeBZn-JILObUa8XcARfg1rWMd/view?usp=drive_link, https://drive.google.com/file/d/1Ju8zjIr6TSa2R_Y3llA16YHYCzN_-eKr/view?usp=drive_link, https://drive.google.com/file/d/1DzEhAuXRgRWeiaRkuF1T0nD7sAo8v80C/view?usp=drive_link, https://drive.google.com/file/d/1WPcfzfOWV-eT4-ZxlnnZrgmksr7R0wX4/view?usp=drive_link, https://drive.google.com/file/d/1-mkeGTHmzOvqHNK70ylH8Y3MJv7w9-9M/view?usp=drive_link

(2016)
https://drive.google.com/open?id=1Xw9IjhfiNL8qNOeSPxaYi3SvXGIL4Q1l&usp=drive_copy
https://drive.google.com/open?id=1tY1vREGyOXkg7_ReJ26krbc5ND3UKy1G&usp=drive_copy
https://drive.google.com/open?id=1whqwNRzC-fyTeWfdwjKaiNwrJZNGqMgJ&usp=drive_copy
https://drive.google.com/open?id=1SZgPUbcXhIzKIKcOLHbyyNCQ-ctsKiuF&usp=drive_copy
https://drive.google.com/open?id=1_Hv7P1Zxg_bDhhFgzuPuLmNuxQ5pwAz5&usp=drive_copy

(2017)
https://drive.google.com/open?id=1Rx_5HhJCul-nEkrfbzW-m2uEO4aG-bVz&usp=drive_copy
https://drive.google.com/open?id=1RUzo-3TzdJTv5YZg911hDMIS39XhCJ0w&usp=drive_copy
https://drive.google.com/open?id=1iSL407e-YhvsjGOo1M-4572aQaO571Uy&usp=drive_copy
https://drive.google.com/open?id=16voftq5CBViIpMT4rLmCLKackrUN5176&usp=drive_copy
https://drive.google.com/open?id=1pduw-WMADxV6wI6HScfVXtmnR1kqDUWb&usp=drive_copy
https://drive.google.com/open?id=1DE5h4EySHlS64YeXazlN7U0ccxlf__LB&usp=drive_copy
https://drive.google.com/open?id=1gZViUt6sgjmHii33InQ0yUYu0iq58REP&usp=drive_copy

(2018)
https://drive.google.com/open?id=1RyyY5Iy4trEPPc8w7MEQFIThlckgT95s&usp=drive_copy
https://drive.google.com/open?id=1p5cU597f4AAHIXCcVCtvOSZ3zhnfzHmC&usp=drive_copy
https://drive.google.com/open?id=1V6DqPDW9C3wcld2tN3JPIqPnsp4HYiyO&usp=drive_copy
https://drive.google.com/open?id=1Ioj-Uw34QS8nztRbT8I3pJAY1ww57ulX&usp=drive_copy
https://drive.google.com/open?id=1NvigJjKS3yDRDXGTaSYFmngNUlbIft0P&usp=drive_copy
https://drive.google.com/open?id=11g-AjkFT1Ni5-m3_97Ey4MeMom7nRXw1&usp=drive_copy
https://drive.google.com/open?id=1aK_NKNlgp17674pTgUQVLy4GLzR0jfO-&usp=drive_copy
https://drive.google.com/open?id=1DZ94VCoMhKKzKcgRZQA-FVgCStQ_-QUD&usp=drive_copy
https://drive.google.com/open?id=1NGK1GCOd1To1yb6aGdZbL4KGPnLgFI9A&usp=drive_copy
https://drive.google.com/open?id=1Ro64YcvRpKD7GRJmxzNAmYQS58QQj-xz&usp=drive_copy
https://drive.google.com/open?id=1YT7NMxFhD-5ZuhJxFksqSs58W7uaR4rP&usp=drive_copy
https://drive.google.com/open?id=1kUbx7K_35LC4TP1o_N53REeR4YbkTNtH&usp=drive_copy
https://drive.google.com/open?id=1x-s3DsoTLEw6gQXgx81u-zipuMsVUlwz&usp=drive_copy

(2019)
https://drive.google.com/open?id=1vY0UA06hlO7ffhU0nrTkx_VW30UwArYR&usp=drive_copy
https://drive.google.com/open?id=1jHgn5N3BpkxI6hbssV7tUgZ02DNXaS9O&usp=drive_copy
https://drive.google.com/open?id=1VgIsfV5cWFhU-capYJ1bIXnzJfd3hWOy&usp=drive_copy
https://drive.google.com/open?id=13jmtg0aa7UCDaItRiZgCg8E1Ey_hsBXE&usp=drive_copy
https://drive.google.com/open?id=1dRoBvYFFheaFtj9KTDGKnJxuMviuBhRM&usp=drive_copy
https://drive.google.com/open?id=1Brh0Cu8zoDqIl5Vc12ibm8TrDuKLFUY5&usp=drive_copy
https://drive.google.com/open?id=1HbR0qAj6tJqaWCMYSJgtr9rAf0z845OA&usp=drive_copy
https://drive.google.com/open?id=1WZcAngdZTmJ2Mkol22nWiVoSrkWo-Du6&usp=drive_copy
https://drive.google.com/open?id=1hZMMQ_WUYI_i3etI61cuPkINtO73qbZc&usp=drive_copy
https://drive.google.com/open?id=14ERIP5tF9gQxxrbR3dgRkceTlTtepBQ0&usp=drive_copy
https://drive.google.com/open?id=1JQcPr2uhIbiHyZUDcFNTziqXPaYra8YA&usp=drive_copy
https://drive.google.com/open?id=1AURwhdITdF9SAp8nMgjbhgK_aNt0ZCJM&usp=drive_copy
https://drive.google.com/open?id=1MoJHub3kjUS1y80aEMXxDFwe5Uf6Yxhh&usp=drive_copy
https://drive.google.com/open?id=1QOprIMp9yoT1m1LXRE6Ba06ocFht03ZR&usp=drive_copy
https://drive.google.com/open?id=1c2IGu-UIvvZ9q6rZj3POiqO4Ws0XMY_w&usp=drive_copy
https://drive.google.com/open?id=176VL9rl1WMpC7J4HV-tvy1IJXhxAOQPq&usp=drive_copy
https://drive.google.com/open?id=1_X1rRBNQmuYtILgCXPw0qwM95NEQiC1p&usp=drive_copy
https://drive.google.com/open?id=1EjoUroF3cARw6a7ElA_vcuBXAVtkFJgd&usp=drive_copy
https://drive.google.com/open?id=1bvyebZel1YYIrmG9F5TSV2HDFwjAVCVQ&usp=drive_copy
https://drive.google.com/open?id=1in9cyWY0kTWVBHkGVvdbV3xJ91iD9IdL&usp=drive_copy

(2020)
https://drive.google.com/open?id=13EFgUUeyqSKNCzENd85QxGake0dcOHvL&usp=drive_copy
https://drive.google.com/open?id=1TRQtszmrDXYD0U9VfU-V5tQCAavZoras&usp=drive_copy
https://drive.google.com/open?id=1n-LESyIjKclUUY1pyBQchsVzYmgYn4Ov&usp=drive_copy
https://drive.google.com/open?id=1DWUVidv1klv8Ke-9ll9CpeTjgKzX20eE&usp=drive_copy
https://drive.google.com/open?id=1BbfVCYDiWgZnQ1hPeTSru8MesSeIgbJv&usp=drive_copy
https://drive.google.com/open?id=1W6ic4G6wczbg04s0J8YQC2dhaZXiGD-N&usp=drive_copy
https://drive.google.com/open?id=1SkWksMdMAuQci5QkSKwiyxjujpduR9mQ&usp=drive_copy
https://drive.google.com/open?id=1SJNecfrzLpcUaoJj0MO0YvE0rd0wBdOX&usp=drive_copy
https://drive.google.com/open?id=1dIiLdb24TdZ3-z_Q13k8K5quZYSNzu2l&usp=drive_copy
https://drive.google.com/open?id=1opCW1ZGcqKUwwzJb-ZbDnnImcBH9mCnh&usp=drive_copy
https://drive.google.com/open?id=1VDGmgRq2qxS7kmr_7AXmnLlT2gcrMCqC&usp=drive_copy
https://drive.google.com/open?id=1MwCafn5hsap8t8PB2NeJfefMdBpVnbvj&usp=drive_copy
https://drive.google.com/open?id=1AGpHoOME1JKzDtR0YinAsRlu3nP_v_6l&usp=drive_copy
https://drive.google.com/open?id=1lzTWngGAXBlipoCfcmM8Ovpqrt1UXHcw&usp=drive_copy
https://drive.google.com/open?id=1_iEVxspxGBacJjoPUq-7T85_1uca3QuX&usp=drive_copy
https://drive.google.com/open?id=1w2DHRnz58ApJj-iIULCd_R-W7d4cINsf&usp=drive_copy
https://drive.google.com/open?id=1lBK4B4ykgFnRNFGnZTOXhz6SIsu82MVW&usp=drive_copy
https://drive.google.com/open?id=1C1xc4h4O-iJzF0xUsgLLkBnWxYKVu0Gs&usp=drive_copy
https://drive.google.com/open?id=1BU2PVAB676H9XFyh0m9dIiyKF6pLoayY&usp=drive_copy
https://drive.google.com/open?id=1cUeX6FCtR_thvb-uJYgTkUib1Rr6iKAG&usp=drive_copy
https://drive.google.com/open?id=110VnMMcnB91cYImTTzF8gEhd0APgXrCl&usp=drive_copy
https://drive.google.com/open?id=1LOLqQVaFJIPDvIVTqVBVfwRLD4iGjl0h&usp=drive_copy
https://drive.google.com/open?id=13h5kooKJO4AoRsvctoykDArOnEm1Hzjk&usp=drive_copy
https://drive.google.com/open?id=1_uTkj4Q3mDAxIeczMAah327dZkfRmwRP&usp=drive_copy
https://drive.google.com/open?id=1VtFFPGEYzc7gC4NZchJDgmOS3ytN6Oau&usp=drive_copy
https://drive.google.com/open?id=19NB3cx0sXT0rAHW9YrVui_3S4vhz8QIZ&usp=drive_copy

(2021)
https://drive.google.com/open?id=1ZnIyNZRe7yHMIru8R7Gn2GvdZi0CWxjf&usp=drive_copy
https://drive.google.com/open?id=1CKb8BKAQrJD-o0DqHF587WsxwHyNFdkK&usp=drive_copy
https://drive.google.com/open?id=1iceIKtUALRFjgh1rBR9EEsqQLn_8o05C&usp=drive_copy
https://drive.google.com/open?id=1fLWoQ7kPE417qLfcRYArnNH6jow2rCqB&usp=drive_copy
https://drive.google.com/open?id=1PmvpNeFRXzyE8lkaRFR6x0hxvUB6IvA5&usp=drive_copy
https://drive.google.com/open?id=12SPrubig4clLoFa_dDcDjbtFf4EIwi8m&usp=drive_copy
https://drive.google.com/open?id=1UQM4jlo0xI8aWU7_CMC9yiXaIR8-fVjR&usp=drive_copy
https://drive.google.com/open?id=1yMcFNkFGY0tDE1Nc7pv6abzh9QzD4Zfp&usp=drive_copy
https://drive.google.com/open?id=1s7aCrtJsk1BB_bIkhTWU3CHXhrWJdsPx&usp=drive_copy
https://drive.google.com/open?id=1xUZMYnFWSmWK7bhgXa0VYvUZEAtlcnyz&usp=drive_copy
https://drive.google.com/open?id=1vLMVJfDR9ei0PWY9pgunKa9hHNIaSHqO&usp=drive_copy
https://drive.google.com/open?id=10YZhAVATYcWaM73iefCvS6Thlz1SnVFS&usp=drive_copy
https://drive.google.com/open?id=1kTZRFlVeX8j0XEFH_8etR_XrDTpMGV6s&usp=drive_copy
https://drive.google.com/open?id=12cbeav1enThwLXSJY4rYJyOFRHS_UmkZ&usp=drive_copy
https://drive.google.com/open?id=1M5epIVLje2ho7cEGlA6YSKcFWvMlo5ht&usp=drive_copy
https://drive.google.com/open?id=11uExU3twuThTbaC8zCAxUHDD872rskil&usp=drive_copy
https://drive.google.com/open?id=1b-uzHT_5DysK2aLssS8hw93QezwvnqRJ&usp=drive_copy
https://drive.google.com/open?id=1FBIG2ICiWny-TveH7192Dw248KrP2CuF&usp=drive_copy
https://drive.google.com/open?id=1xStqvEXN_fTgK2VIrVexPxLnHv1t3-Of&usp=drive_copy
https://drive.google.com/open?id=1uuubqMHLS8TSE7AaJDezu67bLUfdFqar&usp=drive_copy
https://drive.google.com/open?id=1w-CbWK4eIRk33TahJVnMUpmdjC5R-NbE&usp=drive_copy
https://drive.google.com/open?id=1tQR1y8ooDHwvN_trB_tZru3l_5HwTd4V&usp=drive_copy
https://drive.google.com/open?id=1Qd06wi2rdE94IhCH81p8iuQ0vDh8x8cd&usp=drive_copy

(2022)
https://drive.google.com/open?id=19XdOeXsW3i9V-iBdIJNrPj6vyvhu2CBT&usp=drive_copy
https://drive.google.com/open?id=1eFoEWLa2rLZIoi0xmFjMB5HV_Vu4IkX2&usp=drive_copy
https://drive.google.com/open?id=1mWLPSgJCjoyL3b5yL8y2utP4ZBlx2MWy&usp=drive_copy
https://drive.google.com/open?id=1ffaQ1hupvtYUgJO6oZzAJiPeZ4tkgjN_&usp=drive_copy
https://drive.google.com/open?id=1LHb61GKVhyPaagRkD9EkPJZ3oMynmMvj&usp=drive_copy
https://drive.google.com/open?id=12lBGqjntcK0YSJ9WUdqHj4ZX22EOxBPL&usp=drive_copy
https://drive.google.com/open?id=1JUzHsI44-NdzCppGTiHt9qdJX7SynZCV&usp=drive_copy
https://drive.google.com/open?id=1GIVovn7CT2zPc72Z1QZm9GD6ykOr8weX&usp=drive_copy
https://drive.google.com/open?id=12ROgGVFLfyBi3if4I5_p_tOQ_5a-sSJP&usp=drive_copy
https://drive.google.com/open?id=1PWP9edoqk8juebrtXDVu1PFDKYAeSfuK&usp=drive_copy
https://drive.google.com/open?id=1f1cUOjppFjRzmtb54pm5lC5LBz2tppLO&usp=drive_copy
https://drive.google.com/open?id=1Xjy_0YgYoMks7D9Z9QifgAC_KZRI1Ye_&usp=drive_copy
https://drive.google.com/open?id=1W_nfpTWatI3MNxb1ijEgWn-l3LZVF4TF&usp=drive_copy
https://drive.google.com/open?id=1Yh1i4nRg-ps2u8NUu7-eCTlvcn2cluwL&usp=drive_copy
https://drive.google.com/open?id=1UGZI9J74QViwAM9WR_rjlsytiB2BXSwc&usp=drive_copy
https://drive.google.com/open?id=13Mwsb4VM3XR-GFeKe8m5IAEo5nepLBin&usp=drive_copy
https://drive.google.com/open?id=11kzS05i2knt44sylSOBYagaf3KDAwORF&usp=drive_copy
https://drive.google.com/open?id=1fHTOSCi7j5xdkHlzy96VhBCj5AddwGk3&usp=drive_copy
https://drive.google.com/open?id=1tDYyF66PMtb8aHc7ddFHzvpOsmk1CjIg&usp=drive_copy
https://drive.google.com/open?id=1dBiduWSB7zb600opR6NjEjPSCky7J-ng&usp=drive_copy
https://drive.google.com/open?id=111qPybNoOqwyQcwlTM2w7Pc5R495JIhL&usp=drive_copy
https://drive.google.com/open?id=1RKR0TRb5nbCcE5d0QjlFilmdnvqMGdZL&usp=drive_copy
https://drive.google.com/open?id=1Fb2Nj4_yYLeh_5mSHOr-_D2hgJGbRkCe&usp=drive_copy
https://drive.google.com/open?id=1KWu2K2Una1LqrVrIwccBIY3EDYbplfVZ&usp=drive_copy
https://drive.google.com/open?id=1FtB-e3bS3AL1IwGF0HLB2UyREWGrTNeh&usp=drive_copy
https://drive.google.com/open?id=1kmXE6HQOKdl8j5PqyKgeKpqL2ByM29Vg&usp=drive_copy
https://drive.google.com/open?id=1x1W8N6gzqpIU8dDLFBE6F77LoHaHkBKJ&usp=drive_copy
https://drive.google.com/open?id=1ot0n1IN57uWhHBCV65H338L01obDXnPu&usp=drive_copy
https://drive.google.com/open?id=1RNIKbG1WanBjZG6q6P0GUUPPRdzoSkZY&usp=drive_copy
https://drive.google.com/open?id=1eVLrYK46JqWxEe710gNkeVMGP-AGhVq9&usp=drive_copy
https://drive.google.com/open?id=1r29fqBRtj1FH5juK98BjnxaNeLPRCObh&usp=drive_copy
https://drive.google.com/open?id=1b3drravrlEagYOHb8fEj0ZUfCzBLDLgF&usp=drive_copy

(2023)
https://drive.google.com/open?id=14UfWOnTZRKZ_ZVxUOxS3XKSelAtC_YVy&usp=drive_copy
https://drive.google.com/open?id=1WkWGZp9pl6rxp1u3h4s1AA1XHCY5YILb&usp=drive_copy
https://drive.google.com/open?id=1QxtGSmnggUnOkgU-ZhgBUf2TKUP1Xatv&usp=drive_copy
https://drive.google.com/open?id=1-TLVbsZhfFf3N20fPJXNjKT1-_sPaK_r&usp=drive_copy
https://drive.google.com/open?id=1xbgCyn0rEbB4stQqjJ_s3RWXFSVUSMbD&usp=drive_copy
https://drive.google.com/open?id=1hMucnlVxAvtgBpYwWxrV69Ld04BB6rzG&usp=drive_copy
https://drive.google.com/open?id=1sTP2814bMiT0LTDdDvfnQm4n5Jr_MadD&usp=drive_copy
https://drive.google.com/open?id=1BUXg_Pg2DCWKDn1r0aHNIUJ50W3zpSWc&usp=drive_copy
https://drive.google.com/open?id=1nVK_Yj-QMIEVhDovlcPeUnto85MERYEy&usp=drive_copy
https://drive.google.com/open?id=1toEaGkPi_tmv-c6FUckaJfZQwopSob5S&usp=drive_copy
https://drive.google.com/open?id=192B9D5ujDnFaHjmRPsZ1O8faWiM85RW1&usp=drive_copy
https://drive.google.com/open?id=1Fw3cFxMkgROIG9zg9Z30RcXgmeCqRM3E&usp=drive_copy
https://drive.google.com/open?id=1KhuTAyyNx9WLiLt2mQSUArkDFohzzect&usp=drive_copy
https://drive.google.com/open?id=1fe-axx15GvMkj7fjLKYxMd3YXmNCA4kz&usp=drive_copy
https://drive.google.com/open?id=1fCk04BpSMx8nsBj3aKHTvoJiyl7AItN9&usp=drive_copy
https://drive.google.com/open?id=1m3AcwENs9zJ6tktx0W2RO48YkVnF8BT2&usp=drive_copy
https://drive.google.com/open?id=1aHAulnUGN2HAI1gLKVRP5WgMLc5bld0z&usp=drive_copy
https://drive.google.com/open?id=1RojtHRLS3bA7-ymV7pLtQ5CSHIom8kUE&usp=drive_copy
https://drive.google.com/open?id=1GseEhFwd2KuGdPThEwBMLDSBwy4I0vDA&usp=drive_copy
https://drive.google.com/open?id=1u3N5B69qD_of1K5FdTSU7oTWUrfHSboT&usp=drive_copy
https://drive.google.com/open?id=1PvoFBIT7QPt2X1tzvg66DqV_D7Qdz8aP&usp=drive_copy
https://drive.google.com/open?id=1ODYdg_oqNC3KNrgmJln-PFm4YV7XGqTI&usp=drive_copy
https://drive.google.com/open?id=16c4UlsVgKJPQ9ZDslJtgAYeJWAdi-gUO&usp=drive_copy
https://drive.google.com/open?id=15GOnxuDwqBpq8h4DLacw0tmyJF34gR0N&usp=drive_copy
https://drive.google.com/open?id=1DK0FXxsSVZkhdTw7V5FyAjA5kRJmOl1n&usp=drive_copy
https://drive.google.com/open?id=1WRpNZ_NDjZGXu7_RUY33Zel8UUAVD1NP&usp=drive_copy
https://drive.google.com/open?id=10BPsFrj7rQsQelgHUTMgDICKokiX3Rb6&usp=drive_copy
https://drive.google.com/open?id=1mqP9pScl5A7qDXTRfMTj4ZHWqNUXDXB-&usp=drive_copy
https://drive.google.com/open?id=1xqDzlg-NPUf_4SGQYDoquhr-OWpiiAYA&usp=drive_copy
https://drive.google.com/open?id=1KxhtCYN4vloz0dYrRNmtEnzPkvtHRCaD&usp=drive_copy
https://drive.google.com/open?id=1etVPw6JG6q2uuRH2Jo_9Vh6AautfmnUE&usp=drive_copy
https://drive.google.com/open?id=1szEWNupw55UMJGhvaQ_oob3_LBGDQ7G8&usp=drive_copy
https://drive.google.com/open?id=1JTOi3_HsMCjffe-pLC82RWDktpzJqNR5&usp=drive_copy
https://drive.google.com/open?id=1RhUeKhUOBJtsSC1a_kA8S4UnFIEg1bTY&usp=drive_copy
https://drive.google.com/open?id=1A4gco8WF1OfOS94dOrR_MBUPD_e-5H9d&usp=drive_copy
https://drive.google.com/open?id=10wIfoUtVDjehWjtT_aW_vCnVeH3kFto_&usp=drive_copy
https://drive.google.com/open?id=1JVD_tRGA1zHVVf7bz8eSXvduemi9FXla&usp=drive_copy
https://drive.google.com/open?id=1ykGkzYIjaH9ck3nXqgKD5rHkmaR9V0PE&usp=drive_copy
https://drive.google.com/open?id=1moh489TocGtnopg8eGNyUTNGBSKa39h5&usp=drive_copy
https://drive.google.com/open?id=1nufkflVvbYKtKuniIz3HxPm7CY8JZVj6&usp=drive_copy
https://drive.google.com/open?id=1tA9kwQTZTwU_adm3ZLFhRSZUSS1b4drF&usp=drive_copy
https://drive.google.com/open?id=16Fvq6fu507bVIV2qommxi2mhDdDfDmTc&usp=drive_copy
https://drive.google.com/open?id=1dSEknjtuJvXgIcSOebXD4XVSvygyinYh&usp=drive_copy
https://drive.google.com/open?id=1FxnYsqH8VpSlvkTo4KUUMHnrg7UkwYb5&usp=drive_copy
https://drive.google.com/open?id=1HnweWjmaa_t94N_NhaWrXgDCR-xOXWdT&usp=drive_copy
https://drive.google.com/open?id=1Fn5zXBhSYID_vcfgkDFLaxSOu81x7BRx&usp=drive_copy
https://drive.google.com/open?id=1CsLG5N96zk22wiGau6cS2d1TRtuITU1q&usp=drive_copy
https://drive.google.com/open?id=1sDk3IgQyC4CQPhfBvXIIfVYwwIkmsOVx&usp=drive_copy
https://drive.google.com/open?id=10aTsOvGDfdIlXwxAjshiwOGzwnBIq-_T&usp=drive_copy

STRINGED TOGETHER:
https://drive.google.com/open?id=1JrSw-pcU3jARNbtbAyK-3SICCqWna_QZ&usp=drive_copy
https://drive.google.com/open?id=1gRRsGMIHdRVRwbP8l76bq7mrK3II8ytx&usp=drive_copy
https://drive.google.com/open?id=1sG9-321pdW9cZjUOVDnXF1L77EyZYYQk&usp=drive_copy
https://drive.google.com/open?id=18xpg2tiswmzHNomiXcD7dP9aVMD9iA2z&usp=drive_copy
https://drive.google.com/open?id=1JAxS3KRqWDap7ryujUt6w7laaHKTciGP&usp=drive_copy
https://drive.google.com/open?id=1PJzeZrJNoC31Gcgepbr8vVmKQ6MvHNhx&usp=drive_copy
https://drive.google.com/open?id=1PCidxOsLPfhhej_bD-Zyqpu6wI85hL-0&usp=drive_copy
https://drive.google.com/open?id=1QuluZViyjf0aYgi_s9o1l9AJ6ItYboA3&usp=drive_copy

Billy Nashville 2024:
https://drive.google.com/open?id=1Ms_YRFY-Aq7078VaNKVtn1tZBcCNC0X6&usp=drive_copy
https://drive.google.com/open?id=1oVujGPimrLMIxx8Ltbv5JxCCArlCN2sL&usp=drive_copy
https://drive.google.com/open?id=1xkJIHTqZm67J-GnoyxckKCjSl1DUMO8P&usp=drive_copy

Billy & The Kids 2021:
https://drive.google.com/open?id=1HzJVEA-vzd5j4SVXd_e-K9KniD88rnF6&usp=drive_copy
https://drive.google.com/open?id=1hlbu6HZj6MSgC5VIGAoXAaNsw3HVzPfg&usp=drive_copy
https://drive.google.com/open?id=1Mo9dtK0cfD7thfm1bgDzw5RH4SNcVY4P&usp=drive_copy
https://drive.google.com/open?id=1xD-nzh0H-LihhXLwLvVUuAUiyoYFo1pg&usp=drive_copy
https://drive.google.com/open?id=1sxbLCY38jbZH8HE5ITVWuXft14tsTCqj&usp=drive_copy

2025:
https://drive.google.com/open?id=1cMS_Oe14ot-fhF5QeRl9Q8wvIlJ5LkAu&usp=drive_copy
https://drive.google.com/open?id=1Ux0lzHQ09G5Qoxao_jk8IIWJRjykQ6aD&usp=drive_copy
https://drive.google.com/open?id=1IJsD_u5oO78NDEhBx-gFcEh7s9NpmEqy&usp=drive_copy
https://drive.google.com/open?id=1ciDU73h6VMGRW4FRTIBVNA-gIndk6K8l&usp=drive_copy
https://drive.google.com/open?id=12KeRviYDWudMBuvhtHk3I6fxMk2M636H&usp=drive_copy
https://drive.google.com/open?id=1goTfO0yyEvFynOMz8DY26ZFXj5ne7oBN&usp=drive_copy
https://drive.google.com/open?id=1L-rLcr133_KsccqicpJ5erFGH-w8o9Gv&usp=drive_copy
https://drive.google.com/open?id=1Tj5kULqAIGheUKwJFlYbam5SZB_k_IuA&usp=drive_copy
https://drive.google.com/open?id=1pfupTE5aECEzDlKbW7LpB_IEMinVy3EX&usp=drive_copy
"""

# Extract all IDs from user_message
user_ids = re.findall(r'id=([a-zA-Z0-9_\-]+)', user_message)
# And handle /file/d/IDs
user_ids += re.findall(r'/file/d/([a-zA-Z0-9_\-]+)', user_message)

user_ids = sorted(list(set(user_ids)))

# Read existing file
with open('/src/data/shows.ts', 'r') as f:
    file_content = f.read()

missing_ids = []
for uid in user_ids:
    if uid not in file_content:
        missing_ids.append(uid)

print(f"Total Unique User IDs: {len(user_ids)}")
print(f"Missing IDs: {len(missing_ids)}")
for mid in missing_ids:
    print(mid)
