// 変換後に残す文字の初期値
const DEFAULT_EXCLUDE_WORDS = "、。①②③④⑤⑥⑦⑧⑨1234567890１２３４５６７８９０：:＋+✕×～~－‐-・●「」（）()／/";
/**
 * ページロード後イベント
 */
window.onload = () => {
    // 変換後に残す文字の初期値設定
    document.getElementById('excludeWords').value = DEFAULT_EXCLUDE_WORDS;
}


const handleResetClick = (e) => {
    if(!confirm('変換後に残す文字を初期状態に戻しますか？')) {
        return;
    }
    document.getElementById('excludeWords').value = DEFAULT_EXCLUDE_WORDS;

    document.querySelectorAll(['input[type="checkbox"]']).forEach(elm => {
        elm.checked = false;
    });
}

const handleClearClick = (e) => {
    if(!confirm('入力をクリアしますか？')) {
        return;
    }
    document.getElementById('srcText').value='';
}

const handleTransformClick = (e) => {
    // 色々考えるのだるいので全部まとめて囲んどく
    try {
        // 元のテキストが入っているTextArea
        const src = document.getElementById('srcText');
        
        // LP, EXをそのまま残すかどうかのチェックボックス 
        const keepCkbs = [
            document.getElementById('keepLP'),
            document.getElementById('keepEX'),
            document.getElementById('keepNo'),
        ];
        
        // 変換しない文字が入っているテキストボックス
        const excludeWords = document.getElementById('excludeWords');

        // 変換後のテキストを入れるTextArea
        const result = document.getElementById('transformedText');
        // 今入力されてる分は消す
        result.value = '';
        
        // 変換結果をコピーするかどうか
        const isCopyToClip = document.getElementById('copyResult').checked;
        

        // 変換しない文字 (改行とスペースは問答無用で残す)
        const excludeWordList = [...excludeWords.value, " ", "　", "\n"];

        // LP, EXを必要に応じて追加
        keepCkbs.forEach(ckb => {
            if (ckb.checked) {
                excludeWordList.push(ckb.value);
            }
        })

        // 入力の各文字に対して、◯に置換するかどうかのフラグを管理する (trueなら置換対象)
        const isReplaceTarget = new Array(src.value.length).fill(true);

        // 残す文字列の置換フラグをfalseにする
        excludeWordList.forEach(w => {
            // 残す文字列を1つずつ取り出し、それが出てこなくなるまで回す
            let pos = src.value.indexOf(w);
            while (pos !== -1) {
                // マッチした箇所は置換フラグfalseにしていく
                for(let i=0; i<w.length; i++) {
                    isReplaceTarget[pos + i] = false; 
                }
                // 今まで見た場所の次から、もう一度検索しに行く
                // ※みつからなければ-1となりループを抜ける
                pos = src.value.indexOf(w, pos + 1);
            }
        });

        // 改行条件
        const newLineWithEffectNo = document.getElementById('newLineWithEffectNo').checked;
        const newLineWithPeriod = document.getElementById('newLineWithPeriod').checked;

        // 変換結果をセット
        const transformedText = [...src.value].map((c, i) => {
            let returnChar = c.toString();
            if (newLineWithEffectNo && ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'].includes(c) && src.value[i+1]=="：") {
                returnChar = "\n" + returnChar;
            } else if (newLineWithPeriod && c == '。') {
                returnChar += "\n";
            }
            return isReplaceTarget[i] ? '◯' : returnChar;
        }).join('').replace(/(\r?\n){2,}/g, '\n');
        result.value = transformedText;

        // 必要ならクリップボードにコピー
        if (isCopyToClip) {
            navigator.clipboard.writeText(transformedText)
            .then(() => {
                // なにもしなくていいかな
            })
            .catch(() => {
                alert('クリップボードへのコピーに失敗しました。');
            });
        }

    } catch(e) {
        alert('エラーが発生しました。再度試すか、画面を再読み込みしてください。');
        console.log(e);
    }

}