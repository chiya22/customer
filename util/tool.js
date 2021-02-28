
const returnvalue = (value) => {
  return (value ? '"' + value + '"' : null);
};

const getToday = () => {
  const d = new Date();
  let mm = ('00' + (d.getMonth() + 1)).slice(-2);
  let dd = ('00' + d.getDate()).slice(-2);
  return d.getFullYear() + mm + dd;
}

const getTodayTime = () => {
  const d = new Date();
  let mm = ('00' + (d.getMonth() + 1)).slice(-2);
  let dd = ('00' + d.getDate()).slice(-2);
  let hh = ('00' + d.getHours()).slice(-2);
  let mi = ('00' + d.getMinutes()).slice(-2);
  let ss = ('00' + d.getSeconds()).slice(-2);
  return d.getFullYear() + mm + dd + hh + mi + ss;
}

// 年月日（yyyymmdd形式）をもとに、日付区分（1->通常日、2->土日祝）を返却する
const getDayKubun = (yyyymmdd) => {

  // 2020年から2022年までの祝日
  const holiday = [
    '20200101',
    '20200113',
    '20200211',
    '20200223',
    '20200224',
    '20200320',
    '20200429',
    '20200503',
    '20200504',
    '20200505',
    '20200506',
    '20200723',
    '20200724',
    '20200810',
    '20200921',
    '20200922',
    '20201103',
    '20201123',
    '20210101',
    '20210111',
    '20210211',
    '20210223',
    '20210320',
    '20210429',
    '20210503',
    '20210504',
    '20210505',
    '20210722',
    '20210723',
    '20210808',
    '20210809',
    '20210920',
    '20210923',
    '20211103',
    '20211123',
    '20220101',
    '20220110',
    '20220211',
    '20220223',
    '20220321',
    '20220429',
    '20220503',
    '20220504',
    '20220505',
    '20220718',
    '20220811',
    '20220919',
    '20220923',
    '20221010',
    '20221103',
    '20221123'
  ]

  const dayofweek = new Date(yyyymmdd.slice(0, 4), yyyymmdd.slice(4, 6), yyyymmdd.slice(-2)).getDay();
  if (dayofweek === 0 || dayofweek === 6 || holiday.includes(yyyymmdd)) {
    return 2;
  } else {
    return 1;
  }
}

// 年月（yyyymmdd形式）をもとに、その年月の日数を戻す
// kubun: 1->通常日、2->土日祝、3->非稼働(通常日)、4->非稼働(土日祝)
const getDays = (yyyymm, kubun) => {

  const noworkday = [
    '20200101',
    '20200102',
    '20200103',
    '20201229',
    '20201230',
    '20201231',
    '20210101',
    '20210102',
    '20210103',
    '20211229',
    '20211230',
    '20211231',
    '20220101',
    '20220102',
    '20220103',
    '20221229',
    '20221230',
    '20221231',
  ]

  // 末日を取得
  const lastday = new Date(yyyymm.slice(0, 4), yyyymm.slice(-2), 0).getDate();

  let days_futuu = 0;
  let days_yasumi = 0;
  let days_nowork_futuu = 0;
  let days_nowork_yasumi = 0;

  // 日数加算
  for (i = 1; i <= lastday; i++) {
    let target_yyyymmdd = yyyymm + ('' + '0' + i).slice(-2);
    let day_kubun = getDayKubun(target_yyyymmdd)
    if (day_kubun === 1) {
      if (noworkday.includes(target_yyyymmdd)) {
        days_nowork_futuu += 1;
      } else {
        days_futuu += 1;
      }
    } else {
      if (noworkday.includes(target_yyyymmdd)) {
        days_nowork_yasumi += 1;
      } else {
        days_yasumi += 1;
      }
    }
  }

  if (kubun === 1) {
    return days_futuu;
  } else if (kubun === 2) {
    return days_yasumi;
  } else if (kubun === 3) {
    return days_nowork_futuu;
  } else if (kubun === 4) {
    return days_nowork_yasumi;
  } else {
    return 0;
  }
}

// 年月と日付区分をもとに、時間を算出する
// kubun_day: 1->通常日、2->土日祝、3->非稼働(通常日)、4->非稼働(土日祝)
// kubun_room: 1->全体、2->4階、5階、3->地下ミーティングルーム、4->地下プロジェクトルーム
const getHourbyYYYYMM = (yyyymm, kubun_day, kubun_room) => {

  const days = getDays(yyyymm, kubun_day);

  let num_room = 0;
  if (kubun_room === 1) {
    num_room = 20;
  } else if (kubun_room === 2) {
    num_room = 9;
  } else if (kubun_room === 3) {
    num_room = 6;
  } else if (kubun_room === 4) {
    num_room = 5;
  }

  if ((kubun_day === 1) || (kubun_day === 3)) {
    return days * 13 * num_room;
  } else if ((kubun_day === 2) || (kubun_day === 4)) {
    return days * 10 * num_room;
  } else {
    return 0;
  }
}

module.exports = {
  returnvalue,
  getToday,
  getTodayTime,
  getDayKubun,
  getDays,
  getHourbyYYYYMM,
};